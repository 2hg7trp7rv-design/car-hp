# 専門回の独立クロスレビュー

確認日: 2026-09-25。対象は `engine-torque.json` と `tires-brakes.json` の evaluation 各3回。著者とは別の担当で全文、図表、条件、設問、一次資料を照合した。この記事の実車試験や整備士による監修を意味しない。

## 結果

重大な誤りは見つからず、2つのJSONは変更していない。下記の軽微な表現は統合担当への提案として記録した。独立の再計算と掲載値の対応を確認し、`tests/learning.test.ts` は2件成功。

本文は注意書きだけではない。エンジンは「トルクが下がっても出力は増える」「同じ車速ならギアによりエンジン回転数も変わる」「同じ過給圧でも密度・充填・点火が違う」を、数値・因果・判断問題でつないでいる。タイヤ／ブレーキは「摩耗の観測から点検候補を絞る」「空走と制動に影響する条件を分ける」「総エネルギーと部品温度、パッドとフルードの異常を分ける」まで到達している。

## 一次資料との照合

以下のリンクはこのレビューでも実際に開いて該当箇所を確認した。

| 確認対象 | 資料と確認した内容 | 評価 |
| --- | --- | --- |
| 軸出力・トルク・回転数 | [ニデック・グレスナー、冊子78ページ／PDF79ページ](https://www.nidec.com/files/user/www-nidec-com/nidec-drivetechnology/product/download/catalogs_pdf/GRAESSNER/GRAESSNER_Digest_71100.pdf#page=79) の T=9550P/n、[Honda N-BOX](https://www.honda.co.jp/Nbox/webcatalog/performance/) の非ターボ i-VTEC 43kW/7,300rpm・65N・m/4,800rpm | 出力とトルクのピークを同じ回転数と扱っていない。減速機の製品性能・ターボ側の仕様を流用していない。 |
| 減速比・伝達効率・駆動力 | [NPTEL Lecture 4](https://archive.nptel.ac.in/content/storage2/courses/108103009/module2/lec4/7.html) の伝達効率の範囲、[MathWorks歯車モデル](https://www.mathworks.com/help/sdl/ref/simplegearwithvariableefficiency.html) の角速度・トルク・損失、[車両モデル](https://www.mathworks.com/help/sdl/ref/longitudinalvehicle.html) | 効率0.90はエンジンから車輪までの仮定。Fは駆動輪合計で、車輪数を二重に掛けていない。比較時に回転数とトルクの運転点が変わる。 |
| 圧力・温度・ノック | [NASA状態方程式](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/equation-of-state/)、[Garrett過給機選定](https://www.garrettmotion.com/racing-and-performance/choosing-a-turbocharger/) Example、[Garrett Advanced](https://www.garrettmotion.com/knowledge-center-category/oem/advanced/) Compression ratio with boost、[Boschノックセンサー](https://www.bosch-mobility.com/media/global/solutions/commercial-vehicles/powertrain-solutions/natural-gas/knock-sensor/product_data_sheet_knock_sensor.pdf) TASK/FUNCTION | ゲージ圧と絶対圧、測定位置、ケルビンを区別。密度変化率を出力変化率にしていない。メーカー例の出力・改善率・オクタン価を国内車へ流用していない。NASAページにある273.16表記は教材へ転記せず、教材の273.15を維持。 |
| ノックとプレイグニッション | [DENSO Spark Plug Manual](https://assets.denso-am.eu/production/attachments/Spark-Plug-Manual-English_v2.pdf) 冊子27ページ／PDF29ページ | 未燃部の自着火と、火花前の着火を区別できている。点火調整手順の指示になっていない。 |
| 偏摩耗からの推論 | [ブリヂストン](https://tire.bridgestone.co.jp/about/maintenance/friction/)、[ミシュラン](https://www.michelin.co.jp/auto/advice/change-tyres/tyre-wear) の摩耗原因・アライメント・部品劣化の説明 | 模様は原因候補として扱い、現在の空気圧で使用履歴を断定しない。写真・平均溝深さから走行可能と結論づけていない。 |
| 停止区間・ABS | [JAF車間距離](https://jaf.or.jp/common/kuruma-qa/category-drive/subcategory-technique/faq138)、[Honda N-BOX 2024 ABS](https://www.honda.co.jp/ownersmanual/webom/jpn/n-box/2024/details/136238090-10572.html)、[OpenStax非保存力](https://openstax.org/books/college-physics-2e/pages/7-5-nonconservative-forces) | JAFの例示距離を教材のμ一定モデルの計算値と混同していない。μはタイヤと路面の仮定でパッドのμではない。ABSの車種固有閾値を一般化していない。 |
| 熱とフェード | [OpenStax熱容量](https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity)、[JAFブレーキの高熱](https://jaf.or.jp/common/kuruma-qa/category-drive/subcategory-technique/faq092)、[DIXCELフルード](https://www.dixcel.co.jp/literature/lid-270/) | 摩擦材の効きの低下とフルードの沸騰を分離。JAFの説明順を、必ず順番に起きる因果として流用していない。総エネルギーからローター温度を捏造していない。 |
| 実在製品の温度表示 | [DIXCEL Specom-β](https://www.dixcel.co.jp/product/pad/specom-%CE%B2/) の適正温度200～900℃、ハードユース、SAE J2522第2フェード試験、一般道使用上の注意 | 数値と試験名は一致。競技向け製品を公道用の最適品・推奨品としていない。掲載試験はCBJの実測と扱っていない。 |

## 独立再計算

Nodeで元の物理量から再計算した。出力は角速度の厳密式も併用した。

| 対象 | 再計算結果 | 掲載との対応 |
| --- | --- | --- |
| P=T×n/9550、5点 | 75.392670 / 96.335079 / 109.947644 / 113.089005 / 108.900524 kW | 75.4 / 96.3 / 109.9 / 113.1 / 108.9 と一致。 |
| 6,000→6,500rpm、180→160N・m | 出力比0.96296296、約3.7%減 | 回転数増だけで判断しない結論と一致。 |
| Hondaピーク逆算 | 約56.25N・m、32.67kW | 56.3N・m、32.7kWは公表値の丸めも含む概算として妥当。 |
| 出力の問題、220N・m×4,000rpm／140N・m×6,000rpm | 約92.1／88.0kW、比0.954545 | 約4.5%減と一致。 |
| 72km/h、r=0.300m | 車輪636.619772rpm。総減速比5.6／8.0でエンジン3565.070725／5092.958179rpm | 掲載の概数と一致。 |
| 230N・m×5.6×0.90／200N・m×8.0×0.90 | 車輪1159.2／1440N・m、駆動力3864／4800N、77.28／96.00kW | 同じ車速で駆動力約24.2%増。ギアが仕事率を増幅したという説明になっていない。 |
| 加速度の問題 | (4500−500)/1600=2.50、/1800=2.222222 m/s² | 抵抗を差し引くことと質量の条件が明示される。 |
| 同圧、30/50/70/90℃の密度比 | 100 / 93.810924 / 88.343290 / 83.477902 % | グラフの100 / 93.8 / 88.3 / 83.5と一致。40→80℃の設問は0.886733683、約11.3%減。 |
| μ=0.7、g=9.8、t=1秒、20/40/60/80km/h | 停止距離7.805133 / 20.109419 / 36.912860 / 58.215455 m | 7.8 / 20.1 / 36.9 / 58.2mと一致。各区間も独立計算。 |
| 60km/hの条件変更 | μ=0.4で52.097506m、t=1.5秒で45.246194m。遅れ0.5秒増は8.333333m | 表と設問に一致。 |
| 1500kgの40→0、80→0、100→60km/h | 92.592593 / 370.370370 / 370.370370kJ、後者5回は1851.851852kJ | 92.6 / 370.4 / 370.4kJ、約1852kJと一致。 |

グラフの横軸は回転数rpm、温度℃、初速度km/h。`xValues`と表示ラベル・値の数が合い、6,000→6,500rpmの間隔を数値として保持している。密度は30℃を100%とする相対値、停止距離はm、出力はkWで、単位や評価量の混同は見つからなかった。

## 軽微な提案と限界

- `stopping-distance-model` のシュナの「気づくまでの時間だけで8m以上」は、直前の空走定義「気づいてから効き始めるまで」と少しずれる。「ブレーキが効き始めるまでの遅れだけで8m以上」なら区間が揃う。計算や設問の結論は正しいため、このレビューでは修正しない。
- 9550は丸めた定数であるため、210N・m・5,000rpmは掲載式なら109.9476→109.9kW、厳密なP=T×2πn/60000なら109.9557→110.0kWとなる。本文は9550による計算と明記しており誤計算ではない。将来再計算するときに定数だけを変えて本文とグラフを不一致にしない。
- 実測による車種別の性能差、μの速度依存、タイヤの荷重依存、回転慣性、熱配分・放熱の同定までは扱っていない。現在の教材はそれらを無視する条件を明記した物理モデルと読み方の訓練であり、実車の性能予測や整備診断を完成させたものではない。
- ブラウザ描画、モバイル表示、全体ビルド、デプロイはこのレビューの検証範囲外で、統合担当が確認する。
