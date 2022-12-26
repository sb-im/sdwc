namespace ApiTypes {
  export interface LoginResponseOk {
    access_token: string;
    token_type: string;
    expires_in: number;
    created_at: number;
  }

  export interface LoginResponseErr {
    error: string;
    error_description: string;
  }

  namespace V3 {
    export interface ServerStatus {
      build_date: string;
      language: string;
      time: string;
      timezone: string;
      version: string;
    }

    export interface Login {
      code: number;
      /** error message */
      message?: string;
      expire?: string;
      token?: string;
    }

    export interface SwitchTeam {
      expire?: string;
      token?: string;
      /** error message */
      error?: string;
    }

    export interface BaseEntity {
      id: number;
      created_at: string;
      updated_at: string;
    }

    export interface Team extends BaseEntity {
      name: string;
    }

    export interface User extends BaseEntity {
      language: string;
      team_id: number;
      teams: Team[];
      timezone: string;
      username: string;
    }

    export interface Point {
      name: string;
      type: string;
      params: any;
      node_id?: string;
    }

    export interface Node {
      id: string;
      uuid: string;
      name: string;
      points?: Point[];
    }

    export interface Task extends BaseEntity {
      name: string;
      index: number;
      node_id: string;
      files?: { [key: string]: string };
      extra?: { [key: string]: string };
    }

    export interface Job extends BaseEntity {
      /** job ordinal number */
      index: number;
      files?: { [key: string]: string };
      extra?: { [key: string]: string };
    }

    export interface TaskWithJobs extends Task {
      jobs: Job[];
    }

    export interface TaskWithJob extends Task {
      job: Job;
    }

    export interface Blob extends BaseEntity {
      name: string;
      uxid: string;
    }

    export interface Schedule extends BaseEntity {
      name: string;
      /**
       * cron expression https://pkg.go.dev/github.com/robfig/cron/v3#hdr-Usage
       */
      cron: string;
      enable: boolean;
      method: string;
      params: string;
    }

  }
}
