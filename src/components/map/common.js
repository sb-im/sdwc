export const Colors = [
  '#409EFF', // element primary blue
  '#67C23A', // element success green
  '#E6A23C', // element warning orange
  '#F56C6C', // element danger red
  '#909399', // element info grey
  '#f69730', // amap-ui default orange
  '#8adaff', // amap-ui default lightblue
  '#bbf970', // amap-ui default lightgreen,
  '#ff8e7f', // amap-ui default salmon
  '#d252b9', // amap-ui default orchid
];

export function randColor(name) {
  return Colors[Number.parseInt(name, 36) % Colors.length];
}
