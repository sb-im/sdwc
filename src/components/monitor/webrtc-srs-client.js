// @ts-check

import wretch from 'wretch';
import { EventEmitter2 } from 'eventemitter2';

// https://github.com/ossrs/srs/blob/v5.0.21/trunk/3rdparty/signaling/www/demos/js/srs.sdk.js

const __internal = {
  defaultPath: '/rtc/v1/play/',
  prepareUrl: function (webrtcUrl) {
    var urlObject = __internal.parse(webrtcUrl);

    // If user specifies the schema, use it as API schema.
    var schema = urlObject.user_query.schema;
    schema = schema ? schema + ':' : window.location.protocol;

    var port = urlObject.port || 1985;
    if (schema === 'https:') {
      port = urlObject.port || 443;
    }

    // @see https://github.com/rtcdn/rtcdn-draft
    var api = urlObject.user_query.play || __internal.defaultPath;
    if (api.lastIndexOf('/') !== api.length - 1) {
      api += '/';
    }

    apiUrl = schema + '//' + urlObject.server + ':' + port + api;
    for (var key in urlObject.user_query) {
      if (key !== 'api' && key !== 'play') {
        apiUrl += '&' + key + '=' + urlObject.user_query[key];
      }
    }
    // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
    var apiUrl = apiUrl.replace(api + '&', api + '?');

    var streamUrl = urlObject.url;

    return {
      apiUrl: apiUrl, streamUrl: streamUrl, schema: schema, urlObject: urlObject, port: port,
      tid: Number(Math.trunc(new Date().getTime() * Math.random() * 100)).toString(16).substr(0, 7)
    };
  },
  parse: function (url) {
    // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
    var a = document.createElement('a');
    a.href = url.replace('rtmp://', 'http://')
      .replace('webrtc://', 'http://')
      .replace('rtc://', 'http://');

    var vhost = a.hostname;
    var app = a.pathname.substr(1, a.pathname.lastIndexOf('/') - 1);
    var stream = a.pathname.substr(a.pathname.lastIndexOf('/') + 1);

    // parse the vhost in the params of app, that srs supports.
    app = app.replace('...vhost...', '?vhost=');
    if (app.indexOf('?') >= 0) {
      var params = app.substr(app.indexOf('?'));
      app = app.substr(0, app.indexOf('?'));

      if (params.indexOf('vhost=') > 0) {
        vhost = params.substr(params.indexOf('vhost=') + 'vhost='.length);
        if (vhost.indexOf('&') > 0) {
          vhost = vhost.substr(0, vhost.indexOf('&'));
        }
      }
    }

    // when vhost equals to server, and server is ip,
    // the vhost is __defaultVhost__
    if (a.hostname === vhost) {
      var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
      if (re.test(a.hostname)) {
        vhost = '__defaultVhost__';
      }
    }

    // parse the schema
    var schema = 'rtmp';
    if (url.indexOf('://') > 0) {
      schema = url.substr(0, url.indexOf('://'));
    }

    var port = Number.parseInt(a.port);
    if (!port) {
      if (schema === 'http') {
        port = 80;
      } else if (schema === 'https') {
        port = 443;
      } else if (schema === 'rtmp') {
        port = 1935;
      }
    }

    var ret = {
      url: url,
      schema: schema,
      server: a.hostname, port: port,
      vhost: vhost, app: app, stream: stream
    };
    __internal.fill_query(a.search, ret);

    // For webrtc API, we use 443 if page is https, or schema specified it.
    if (!ret.port) {
      if (schema === 'webrtc' || schema === 'rtc') {
        if (ret.user_query.schema === 'https') {
          ret.port = 443;
        } else if (window.location.href.indexOf('https://') === 0) {
          ret.port = 443;
        } else {
          // For WebRTC, SRS use 1985 as default API port.
          ret.port = 1985;
        }
      }
    }

    return ret;
  },
  fill_query: function (query_string, obj) {
    // pure user query object.
    obj.user_query = {};

    if (query_string.length === 0) {
      return;
    }

    // split again for angularjs.
    if (query_string.indexOf('?') >= 0) {
      query_string = query_string.split('?')[1];
    }

    var queries = query_string.split('&');
    for (var i = 0; i < queries.length; i++) {
      var elem = queries[i];

      var query = elem.split('=');
      obj[query[0]] = query[1];
      obj.user_query[query[0]] = query[1];
    }

    // alias domain for vhost.
    if (obj.domain) {
      obj.vhost = obj.domain;
    }
  }
};

export class WebRTCSRSClient extends EventEmitter2 {
  /**
   * @param {string | RTCIceServer[]} iceServer
   */
  constructor(iceServer) {
    super();
    this.pc = new RTCPeerConnection({ iceServers: typeof iceServer === 'string' ? [{ urls: iceServer }] : iceServer });
    this.pc.addEventListener('track', e => this.onTrack(e));
    this.pc.addTransceiver('video', { direction: 'recvonly' });
  }

  /**
   * @param {string} url
   */
  async play(url) {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    const conf = __internal.prepareUrl(url);
    // @see https://github.com/rtcdn/rtcdn-draft
    const data = {
      api: conf.apiUrl,
      tid: conf.tid,
      streamurl: conf.streamUrl,
      clientip: null,
      sdp: offer.sdp
    };
    const session = await wretch(conf.apiUrl)
      .post(data)
      .json();
    if (session.code) {
      throw session;
    }
    await this.pc.setRemoteDescription({ type: 'answer', sdp: session.sdp });
    session.simulator = `${conf.schema}//${conf.urlObject.server}:${conf.port}/rtc/v1/nack/`;
    return session;
  }

  close() {
    if (!this.pc) return;
    this.pc.close();
    this.pc = null;
  }

  /**
   * @param {RTCTrackEvent} e
   */
   onTrack(e) {
    this.emit('track', e.streams);
  }
}
