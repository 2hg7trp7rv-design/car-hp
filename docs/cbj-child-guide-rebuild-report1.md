# CBJ 子Guide全面再設計レポート 1

作業日: 2026-06-30
対象: `data/articles/guides/*.json` の既存Guide 6本
基準: `modern-car-custom-regret-reason-column` を親Columnとして扱い、アップロード済みPDFの表示・文脈を正とする。

## 実施方針

- 既存Guideを「専門家向けの詳細記事」ではなく、「初心者の一つの疑問を必要十分な深さで解決する子記事」として再設計。
- 親Columnの3軸である「何を変えたいか」「どこまで影響するか」「元に戻せるか」を、各Guideの冒頭と判断カードへ反映。
- 全Guideの `articleDesign.layoutPreset` を `column-renewal-v1` に統一し、親Columnと同じ参考書型・章番号型の表示へ寄せた。
- 各Guideを5章構成へ再整理し、スマホで読んだときの過密感を下げた。
- 画像は既存 assets のみを使用し、新規画像追加は行っていない。
- `publicState: index` / `noindex: false` を明示し、既存公開Guideとして扱う。

## 対象記事

1. `aftermarket-air-cleaner-risk-guide`
   - 親Columnの吸気系パートを深掘り。
   - センサー、燃調、吸気温度、熱、水、純正戻しへ整理。

2. `car-suspension-hard-soft-merit-demerit`
   - 親Columnの足回りパートを補助する基礎Guideへ再定義。
   - 硬い・柔らかいを「段差後の収まり」で説明。

3. `electronic-damper-coilover-risk-guide`
   - 電子制御ダンパー付き車の車高調交換に特化。
   - キャンセラー、警告灯、純正制御、入庫対応を整理。

4. `adas-lowered-car-aiming-risk-guide`
   - ADAS付き車のローダウンに特化。
   - カメラ、レーダー、車体姿勢、エーミングを整理。

5. `tv-canceller-can-risk-guide`
   - 電装品パートの子Guideとして再設計。
   - CAN通信、方式差、警告灯、保証、復元方法を整理。

6. `used-custom-car-check-guide`
   - 親Columnの「戻せる・説明できる・確認できる」を中古車選びへ展開。
   - 純正部品、施工履歴、配線、試乗確認を整理。

## 未対応・注意

- 実機スマホ表示はこの環境では未確認。
- 既存画像を再利用したため、画像そのものの再制作・画質改善は未実施。
- 画像の情報量がまだ多い箇所はあるため、次工程でPDFまたはスクショ確認後、画像の差し替え・削減判断が必要。
