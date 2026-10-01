export type Prefecture = {
  name: string;
  slug: string;
};

export const PREFECTURES: Prefecture[] = [
  { name: "北海道", slug: "hokkaido" },
  { name: "青森県", slug: "aomori" },
  { name: "岩手県", slug: "iwate" },
  { name: "宮城県", slug: "miyagi" },
  { name: "秋田県", slug: "akita" },
  { name: "山形県", slug: "yamagata" },
  { name: "福島県", slug: "fukushima" },
  { name: "茨城県", slug: "ibaraki" },
  { name: "栃木県", slug: "tochigi" },
  { name: "群馬県", slug: "gunma" },
  { name: "埼玉県", slug: "saitama" },
  { name: "千葉県", slug: "chiba" },
  { name: "東京都", slug: "tokyo" },
  { name: "神奈川県", slug: "kanagawa" },
  { name: "新潟県", slug: "niigata" },
  { name: "富山県", slug: "toyama" },
  { name: "石川県", slug: "ishikawa" },
  { name: "福井県", slug: "fukui" },
  { name: "山梨県", slug: "yamanashi" },
  { name: "長野県", slug: "nagano" },
  { name: "岐阜県", slug: "gifu" },
  { name: "静岡県", slug: "shizuoka" },
  { name: "愛知県", slug: "aichi" },
  { name: "三重県", slug: "mie" },
  { name: "滋賀県", slug: "shiga" },
  { name: "京都府", slug: "kyoto" },
  { name: "大阪府", slug: "osaka" },
  { name: "兵庫県", slug: "hyogo" },
  { name: "奈良県", slug: "nara" },
  { name: "和歌山県", slug: "wakayama" },
  { name: "鳥取県", slug: "tottori" },
  { name: "島根県", slug: "shimane" },
  { name: "岡山県", slug: "okayama" },
  { name: "広島県", slug: "hiroshima" },
  { name: "山口県", slug: "yamaguchi" },
  { name: "徳島県", slug: "tokushima" },
  { name: "香川県", slug: "kagawa" },
  { name: "愛媛県", slug: "ehime" },
  { name: "高知県", slug: "kochi" },
  { name: "福岡県", slug: "fukuoka" },
  { name: "佐賀県", slug: "saga" },
  { name: "長崎県", slug: "nagasaki" },
  { name: "熊本県", slug: "kumamoto" },
  { name: "大分県", slug: "oita" },
  { name: "宮崎県", slug: "miyazaki" },
  { name: "鹿児島県", slug: "kagoshima" },
  { name: "沖縄県", slug: "okinawa" },
];

export const DEFAULT_PREFECTURE = "広島県";

export function getPrefectureBySlug(slug: string): Prefecture | undefined {
  return PREFECTURES.find((prefecture) => prefecture.slug === slug);
}

export function getPrefectureSlug(name: string): string | undefined {
  return PREFECTURES.find((prefecture) => prefecture.name === name)?.slug;
}
