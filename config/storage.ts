// 暫定：product-spec 只要求保存在瀏覽器本地，未定義鍵名與格式版本
export const storageConfig = {
  // 加上專案前綴，避免與同網域的其他專案衝突
  settingsKey: 'drink-fit-balance:settings',
  // 保存格式改變時加 1，讓舊格式的資料不會被當成新格式讀取
  settingsVersion: 1,
}
