# インターフェース定義書

## 1. 概要

この定義書は、`tt_score` ワークスペース内のファイルに含まれる関数の役割、引数、戻り値をまとめたものです。

対象ファイル:
- `index.html`
- `styles.css`
- `script.js`

---

## 2. `index.html`

`index.html` 自体には JavaScript 関数定義は含まれていません。

### 役割
- UI レイアウトと各ボタンのクリックイベントの割り当てを提供する。
- `script.js` 内の関数を `onclick` 属性から呼び出す構造になっている。

### 主要なイベントハンドラ
- `onclick="undo()"`
- `onclick="redo()"`
- `onclick="resetAll()"`
- `onclick="swapCourts()"`
- `onclick="addPoint(1)"`, `onclick="addPoint(2)"`
- `onclick="setInitialServer(1)"`, `onclick="setInitialServer(2)"`
- `onclick="togglePalette(1)"`, `onclick="togglePalette(2)"`
- `onclick="selectPlayerColor(1, '#...')"`, `onclick="selectPlayerColor(2, '#...')"`
- `onclick="exportData()"`
- `onclick="importData()"`

---

## 3. `styles.css`

`styles.css` に関数定義は含まれていません。

### 役割
- ページ全体のレイアウト、配色、ボタン・履歴表示のスタイルを定義する。
- プレイヤーゾーンの背景やカラー選択パレット、サーブ表示の見た目を指定する。
- フリック関連のメニューとガイドのスタイルを定義する。

---

## 4. `script.js`

### グローバル状態
- `state`: 現在のゲーム状態を保持するオブジェクト。
- `undoStack`: 変更前の `state` を JSON 文字列で保存する配列。
- `redoStack`: Undo 後の状態を保存する配列。
- `touchState`: フリック検出用のタッチ状態を管理するオブジェクト。

### `state` のキー
- `score1` (`number`): プレイヤー1 の現在得点。
- `score2` (`number`): プレイヤー2 の現在得点。
- `sets1` (`number`): プレイヤー1 のセット獲得数。
- `sets2` (`number`): プレイヤー2 のセット獲得数。
- `initialServer` (`number|null`): 試合開始時のサーバー。`1` または `2`、未設定時は `null`。
- `scorer` (`number|null`): 直近得点者を表す論理プレイヤー番号。`1` または `2`。
- `player1` (`string`): 画面左側 `zone1` に表示される選手名。
- `player2` (`string`): 画面右側 `zone2` に表示される選手名。
- `playSide` (`number`): `scorer` 値の画面対応を定義するフラグ。
  - `1` は `zone1` が `scorer = 1`、`zone2` が `scorer = 2`。
  - `2` は `zone1` が `scorer = 2`、`zone2` が `scorer = 1`。
- `player1Color` (`string`): `zone1` の背景カラー。
- `player2Color` (`string`): `zone2` の背景カラー。
- `history` (`Array<object>`): 履歴エントリの配列。

初期化は `resetState()` 関数で行われ、立ち上げ時および `resetAll()` で呼び出されます。

#### 履歴エントリの構造
- `time` (`string`): `HH:MM:SS` 形式の記録時刻。
- `msg` (`string`): 操作説明。
- `res` (`string`): 試合スコア表記（例: `1-0`）。
- `scorer` (`number`, 任意): `1` または `2`。画面の列配置で得点者を判断する。
- `action1` (`string`, 任意): 技術タイプ（`Atk` / `Def` / `Pas`）。
- `action2` (`string`, 任意): ラバー面（`Fore` / `Back` / `?`）。
- `action3` (`string`, 任意): 第2選択結果（`NT` / `2B` / `T-Own` / `T-Out` / `Miss` / `Unknown`）。

### 関数一覧
#### `resetState()`
- 役割: Stateを初期化する。
- 引数: なし
- 戻り値: なし

#### `saveToUndo()`
- 役割: 現在の `state` を `undoStack` に保存する。
- 引数: なし
- 戻り値: なし

#### `updateUI()`
- 役割: 現在の `state` を画面に反映し、サーブ表示・履歴表示を更新する。
- 引数: なし
- 戻り値: なし

#### `calculateServer()`
- 役割: 現在のスコアからサーバーを計算する。
- 引数: なし
- 戻り値: `1` または `2` または `null`

#### `hexToRgb(hex)`
- 役割: 16 進カラーコードを RGB オブジェクトに変換する。
- 引数:
  - `hex` (`string`): `#rrggbb` または `#rgb` 形式のカラー文字列。
- 戻り値: `{ r: number, g: number, b: number }`

#### `rgbToHsl(r, g, b)`
- 役割: RGB 値を HSL 形式に変換する。
- 引数:
  - `r` (`number`): 赤成分 0-255
  - `g` (`number`): 緑成分 0-255
  - `b` (`number`): 青成分 0-255
- 戻り値: `{ h: number, s: number, l: number }`

#### `hslToHex(h, s, l)`
- 役割: HSL 値を 16 進カラーコードに変換する。
- 引数:
  - `h` (`number`): 色相 0-1
  - `s` (`number`): 彩度 0-1
  - `l` (`number`): 輝度 0-1
- 戻り値: `string` (`#rrggbb`)

#### `getAccentColor(hex)`
- 役割: ベースカラーからアクセントカラーを生成する。
- 引数:
  - `hex` (`string`): 16 進カラーコード。
- 戻り値: `string` (`#rrggbb`)

#### `getTextColor(hex)`
- 役割: 背景カラーに応じた適切な文字色を判定する。
- 引数:
  - `hex` (`string`): 16 進カラーコード。
- 戻り値: `string` (`#222222` もしくは `#ffffff`)

#### `addPoint(p)`
- 役割: 指定プレイヤーに1点加算し、`state.scorer` を更新してセット判定・UI を更新する。メニュー表示中は無効。
- 引数:
  - `p` (`number`): `1` または `2`
- 戻り値: なし

#### `checkSet()`
- 役割: 11 点先取かつ 2 点差でセット成立判定を行い、セット数を更新し、必要に応じてコートチェンジを行う。
- 引数: なし
- 戻り値: なし

#### `togglePalette(player)`
- 役割: 指定プレイヤーのカラーパレット表示を切り替える。
- 引数:
  - `player` (`number`): `1` または `2`
- 戻り値: なし

#### `closePalettes()`
- 役割: すべてのカラーパレットを非表示にする。
- 引数: なし
- 戻り値: なし

#### `selectPlayerColor(player, color)`
- 役割: 指定プレイヤーの背景色を変更し、履歴と UI を更新する。
- 引数:
  - `player` (`number`): `1` または `2`
  - `color` (`string`): `#rrggbb` 形式のカラーコード
- 戻り値: なし

#### `addLog(msg, res, scorer = null, action1 = null, action2 = null, action3 = null)`
- 役割: 現在時刻付きの履歴エントリを `state.history` に追加する。
- 引数:
  - `msg` (`string`): 操作内容の説明
  - `res` (`string`): 結果テキスト（例: `0-0`）
  - `scorer` (`number|null`, 任意): `1` または `2`。画面表示でどちらの列に記録を表示するかを判定する。
  - `action1` (`string`, 任意): 技術（`Atk` / `Def` / `Pas`）
  - `action2` (`string`, 任意): ラバー面（`Fore` / `Back` / `?`）
  - `action3` (`string`, 任意): 第2選択結果（`NT` / `2B` / `T-Own` / `T-Out` / `Miss` / `Unknown`）
- 戻り値: なし

#### `undo()`
- 役割: `undoStack` から直前状態を復元し、UI を更新する。
- 引数: なし
- 戻り値: なし

#### `redo()`
- 役割: `redoStack` から取り消した状態を再適用し、UI を更新する。
- 引数: なし
- 戻り値: なし

#### `setInitialServer(p)`
- 役割: 初期サーバーを設定し、状態を保存する。
- 引数:
  - `p` (`number`): `1` または `2`
- 戻り値: なし

#### `doSwapCourts(options = {})`
- 役割: 選手名、スコア、セット数、色、`playSide`、初期サーバーを入れ替え、必要なら履歴・Undo を処理する。
- 引数:
  - `options` (`object`, 任意)
    - `skipUndo` (`boolean`): `true` の場合、Undo スタックに保存しない。
    - `skipLog` (`boolean`): `true` の場合、履歴への記録を行わない。
- 戻り値: なし

#### `swapCourts()`
- 役割: `doSwapCourts()` を通常モードで呼び出すラッパー。
- 引数: なし
- 戻り値: なし

#### `resetAll()`
- 役割: 確認ダイアログ後にゲーム状態を初期化し、UI を更新する。
- 引数: なし
- 戻り値: なし

#### `exportData()`
- 役割: 現在の試合情報を独自テキスト形式に変換し、クリップボードにコピーする。
- 引数: なし
- 戻り値: なし

#### `importData()`
- 役割: 独自形式のテキストを読み込み、スコア・セット・カラー・サーバー・履歴を復元する。
- 引数: なし
- 戻り値: なし

#### `detectFlickDirection(startX, startY, endX, endY, isPlayer2)`
- 役割: フリック方向を8方向に判定し、技術・ラバー面を決定する。
- 引数:
  - `startX` (`number`): タッチ開始X座標
  - `startY` (`number`): タッチ開始Y座標
  - `endX` (`number`): タッチ終了X座標
  - `endY` (`number`): タッチ終了Y座標
  - `isPlayer2` (`boolean`): プレイヤー2エリアかどうか
- 戻り値: `{ direction: string, action: string, rubberFace: string, angle: number }` または `null`

#### `showActionMenu(endX, endY, player, flickResult)`
- 役割: フリック結果に基づき、第2選択メニューを画面中央に表示する。メニュー項目はノータッチ・２バウンド・タッチ自陣・タッチアウト・空振り・不明の6択。
- 引数:
  - `endX` (`number`): タッチ終了X座標（未使用）
  - `endY` (`number`): タッチ終了Y座標（未使用）
  - `player` (`number`): プレイヤー番号
  - `flickResult` (`object`): フリック判定結果
- 戻り値: なし

#### `closeActionMenuOnBgClick(e)`
- 役割: メニュー外クリック時にフリック情報のみで得点を記録し、メニューを閉じる。
- 引数:
  - `e` (`Event`): クリックイベント
- 戻り値: なし

#### `closeActionMenu()`
- 役割: アクションメニューを非表示にする。
- 引数: なし
- 戻り値: なし

#### `selectAction(player, action2Value)`
- 役割: 第2選択を確定し、得点・詳細ログを記録する。
- 引数:
  - `player` (`number`): プレイヤー番号
  - `action2Value` (`string`): 選択値（NoTouch/2Bounce/TouchOwn/TouchOut/Miss/Unknown）
- 戻り値: なし

#### `commitFlickWithoutResult(player)`
- 役割: フリック情報のみで得点を記録する（第2選択なし）。
- 引数:
  - `player` (`number`): プレイヤー番号
- 戻り値: なし

#### `initTouchHandlers()`
- 役割: プレイヤーの得点ボタンにタッチイベントハンドラを登録する。
- 引数: なし
- 戻り値: なし

#### `showFlickGuide(player, x, y)`
- 役割: 長押し時に8方向フリックガイドを表示する。ガイドは224pxサイズで、各方向に短いラベルと色分けを表示する。
- 引数:
  - `player` (`number`): プレイヤー番号
  - `x` (`number`): 表示X座標
  - `y` (`number`): 表示Y座標
- 戻り値: なし

#### `closeFlickGuide()`
- 役割: フリックガイドを非表示にする。
- 引数: なし
- 戻り値: なし

---

## 5. 補足

- `script.js` の関数は `window` グローバルスコープに公開され、`index.html` から呼び出される設計です。
- `state.playSide` はコートチェンジ後も得点者判定を一貫して行うために使用します。
- 履歴表示は `state.history` を逆順に描画し、固定幅の列でテーブル風に見せています。
