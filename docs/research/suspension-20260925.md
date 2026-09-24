# 足回り教材の本文改訂・根拠メモ

確認日: 2026-09-25。対象: `data/learning/suspension.json`。このメモは内部編集資料であり、一般読者向けページへは出さない。

## 改訂の目的と内容

従来の3回は役割や用語を紹介できていたが、専門段階の「グラフの軸を見る」だけでは具体的な判断に届かなかった。既存slugを保持し、`damper-speed` を曲線の比較問題まで拡充した。次に、部品単体から車輪側へ換算する `wheel-rate-and-motion-ratio` と、観察・仮説・点検を分ける `ride-symptom-diagnosis` を追加した。全5回、段階は start → mechanism → evaluation → evaluation → evaluation。

初回にはばねの蓄積・放出とダンパーでの散逸を短く追記。三つの専門回は会話だけで引き延ばさず、グラフ、計算の流れ、原因候補の比較表、理由付き確認問題へ分担させている。

## 読んだ一次資料と採用範囲

下記のページ本文を実際に開き、採用箇所を照合した。PDFのページ番号は印刷上の番号。検索結果の公開日表示ではなく、PDF自体の改訂年や記事の表示日を採用している。

| 原稿内ID | 参照資料・場所 | 原稿で支える主張 | 適用を広げない範囲 |
| --- | --- | --- | --- |
| kyb-role | [KYB ショックアブソーバとは？](https://www.kyb.co.jp/kybclub/shockabsorber/about.html) 冒頭と役割説明 | ばねの振動とダンパーの役割 | 製品交換での停止距離短縮等の宣伝文句は数値保証へ使わない |
| kyb-structure | [KYB 構造・種類](https://www.kyb.co.jp/kybclub/shockabsorber/structure.html) 「減衰力」と複筒/単筒の説明 | ピストン、油の流れ、伸び/縮みの抵抗 | 単筒式が常に快適などの方式による優劣を述べない |
| kyb-hls | [KYB NEW SR Technology](https://www.kyb.co.jp/kybclub/more/technology/) HLSの節 | 作動速度ごとに特性を設計する製品事例 | HLSの性能・速度境界を全製品共通にしない |
| penske-manual | [Adjustable Shocks Technical Manual](https://www.penskeshocks.com/hubfs/Resources/Manuals/Adjustable-Manual1.pdf?hsLang=en) 9、15〜17、26〜31ページ | 弁と油の流れ、調整間の影響、力対変位/速度、平均線と加減速中の差 | PDFはREV 3/27/01。旧競技製品のガス圧・設定・分解手順を現在の街乗り車に転用しない |
| penske-curves | [Linear, Progressive, Regressive, Digressive Shock Valving](https://www.penskeshocks.com/blog/linear-progressive-regressive-digressive-shock-valving-differences-and-use-cases) Linear / Digressiveの節、2022-06-27表示 | 直線的な増え方と、途中から勾配が小さくなる特性の区別 | 製品曲線や製品の優劣は転載しない。A/Bは独自に設定した数学例 |
| ohlins-dfv | [DFV Technology](https://www.ohlins.com/technology/dfv-technology) Compression & Rebound、Thermal Expansion | 方向・速度域と油の経路、減衰仕事と発熱・粘度 | DFVの温度補償や性能効果を一般ダンパーの共通仕様としない |
| optimumg-wheel-rate | [Claude Rouelle, Of springs and dampers](https://optimumg.com/wp-content/uploads/2021/10/racecar-2020_11.pdf), Racecar Engineering 2020年11月号50〜52ページ | モーション比の二乗、逆向きの定義、比が変動する場合、タイヤなどの別要素 | 原資料はwheel/spring。本稿はspring/wheelと明示。一定比の近似だけを使い、変動比の厳密な車両モデルまでは主張しない |
| kyb-diagnosis | [KYB Diagnose shocks and struts](https://www.kyb.com/resources/shocks-struts-101/for-service-pros/diagnose-shocks-and-struts/) 試験前の点検・条件をそろえる部分 | 足回りやタイヤの異常が評価へ混入し得るため、状態確認が先 | 一般読者に急な車線変更・急制動を行わせる手順や独自点数基準は採用しない |
| kyb-hand-test | [KYB 手で圧縮した際のFAQ](https://www.kyb.com/resource/faqs/is-the-shock-strut-weak-or-defective-if-i-can-compress-it-easily-by-hand/) 回答本文 | 手押しだけで実際の作動条件を再現できず、良否を確定できない | 現車を読者に取り外させたり、押し試験を勧めたりしない |
| monroe-symptoms | [Monroe Signs of Bad Shocks & Struts](https://www.monroe.com/technical-resources/shocks-101/symptoms-worn-shock-struts.html) Bouncy ride、Unusual noises、Leaking fluid等 | 揺れの継続・異音・漏れを点検の手掛かりとして扱う | 症状だけでダンパーを原因と断定しない。記事中の停止距離増加の定量化もしない |
| bilstein-bump-stop | [BILSTEIN B1](https://workshop.bilstein.com/en/products/bilstein-b1/) バンプストップ説明 | 大きなストロークでの終端緩衝と部品保護 | 切断・取り外し・寸法変更を一般化しない |
| bilstein-height | [BILSTEIN B14](https://performance.bilstein.com/en-us/products/bilstein-b14/) FAQ・装着/調整説明 | 車両別指定範囲、車高変更後にアライメントを確認する製品例 | B14の下降量を他製品/全車両の許容範囲として使わない |

KYBの旧 `ridecontrolworksheet.pdf` の検索結果は確認できたが、直接openが取得エラーとなったため、当該PDFを原稿出典には採用していない。読めた診断ページ本文だけを根拠にしている。

## 独自の計算と例

### 減衰力グラフ

ピストン速度vをm/s、抵抗の大きさFをNとする。すべて縮み側の仮定で、実測値・実在製品の仕様ではない。

- A: v ≤ 0.05 のとき F = 4000v。それ以外では F = 200 + 1000(v − 0.05)。
- B: F = 2500v。
- 横軸: 0、0.02、0.05、0.10、0.20、0.30。非等間隔なので `xValues` を明記する。
- A: 0、80、200、250、350、450N。
- B: 0、50、125、250、500、750N。
- 折れ点0.05m/sはこの例の仮定であり、一般の低速/高速の境界ではない。0.10m/sで交差する。
- 摩擦・ガス反力・温度・履歴を持たせていない。ヒステリシスの説明は元のPenske資料に基づくが、この模式線で実測の輪を再現したとは主張しない。

原稿の数字を独立のNode式で再計算し、全点の差が1e-9未満であることを確認した。

### ホイールレート

r = ばね移動量 / 車輪移動量、一定比・線形ばね・摩擦なし、増分に限定する。車輪側の力と変位の両方を換算するため k_w = k_s r²。原資料のMR = 車輪/ばねなら、k_w = k_s / MR²。

- 60N/mm、r=0.8、車輪10mm: ばね8mm、ばね力増分480N、車輪力増分384N、k_w=38.4N/mm。
- 60N/mm、r=1.0 → 60N/mm。
- 75N/mm、r=0.8 → 48N/mm。38.4に対して25%増。
- 問題: 80N/mm、r=15/20=0.75 → 45N/mm。ばね力増分1200N、車輪力増分900N、900/20=45でも照合。

上記4つのレートを独立のNode式で再計算済み。タイヤ・スタビライザー・バンプストップの寄与や比の微分項を省略した限界を原稿へ明示する。ばね定数が増えた割合を快適性の改善率と表現しない。

### 症状切り分け

荷重時の段差入力の仮想ケースは、各社の役割・点検説明を踏まえた編集部の推論。実車試験、整備相談の実録、原因が確認された症例のどれでもない。原稿に「仮想ケース」と表示した。

「荷重時だけ一発が強い → ストロークや接触も点検対象」という候補選定であり、「原因はバンプストップ」とは断定していない。アライメントのずれと段差突き上げを同じ故障原因として扱わない。観察、仮説、点検結果、変更後の比較を分ける。

## 確認と残る限界

- JSON構文、系列数と数値、前提順序、既存slug維持を確認。数式の独立検算は上記のとおり。
- 公開内容の実車計測や整備資格者による最終校閲は実施していない。商品別の最適減衰設定、車種別のアライメント許容値、部品交換の具体的な手順はこの教材の成果物に含めない。
- 図表のスマートフォン上での可読性や、非等間隔の横軸の実表示は親タスクのレンダラー統合・ブラウザー検証で確認する。JSONだけの成功を表示確認と扱わない。
