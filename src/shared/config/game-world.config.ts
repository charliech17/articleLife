/**
 * 遊戲世界項目設定
 * 供首頁遊戲選單 popover 與 /game-map 地圖頁共用
 */
export interface GameWorldItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** internal 為 true 時為站內路由，否則開新視窗 */
  url: string;
  internal?: boolean;
  /** 地圖頁上的位置（百分比，中心點） */
  mapX: number;
  mapY: number;
  /** 靠近時的提示動作文字 */
  actionText: string;
}

export const GAME_WORLD_ITEMS: GameWorldItem[] = [
  {
    id: 'flappybird',
    name: 'Flappy Bird',
    description: '經典小鳥闖關遊戲',
    icon: '🐦',
    url: 'https://josh-lifesharing.com/flappybird',
    mapX: 72,
    mapY: 30,
    actionText: '前往遊玩'
  },
  {
    id: 'wishing-well',
    name: '許願池',
    description: '許下你想要的新功能',
    icon: '⛲',
    url: '/wishing-well',
    internal: true,
    mapX: 32,
    mapY: 62,
    actionText: '前往許願'
  }
];
