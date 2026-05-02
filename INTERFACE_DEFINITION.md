# インターフェース定義書

## 1. 概要

この定義書は、`tt_score` ワークスペース内のファイルに含まれる関数の役割、引数、戻り値をまとめたものです。

対象ファイル:
- `index.html`
- `styles.css`
- `script.js`

---

## 2. `index.html`

`index.html` 自体には JavaScript 関数定義はありません。

### 役割
- UI レイアウトと各ボタンのクリックイベントの割り当てを提供する。
- `script.js` 内の関数を `onclick` 経由で呼び出す構造になっている。

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

---

## 4. `script.js`

### グローバル状態
- `state`: 現在のスコア、セット数、初期サーバー、選手カラー、履歴を保持するオブジェクト。
- `undoStack`: 変更前の `state` を JSON 文字列で保存する配列。
- `redoStack`: Undo 後の状態を保存する配列。

### 関数一覧

#### `saveToUndo()`
- 役割: 現在の `state` を `undoStack` に保存する。
- 引数: なし
- 戻り値: なし

#### `updateUI()`
- 役割: 現在の `state` を画面に反映し、サーブ表示や履歴を更新する。
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
- 役割: 指定プレイヤーに1点加算し、セット判定・履歴・UI を更新する。
- 引数:
  - `p` (`number`): `1` または `2`
- 戻り値: なし

#### `checkSet()`
- 役割: 11 点先取かつ 2 点差でセット成立判定を行い、セット数更新とコートチェンジを行う。
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

#### `addLog(msg, res)`
- 役割: 現在時刻付きの履歴エントリを `state.history` に追加する。
- 引数:
  - `msg` (`string`): 操作内容の説明
  - `res` (`string`): 結果テキスト（例: `0-0`）
- 戻り値: なし

#### `undo()`
- 役割: `undoStack` から直前状態を復元し、画面を更新する。
- 引数: なし
- 戻り値: なし

#### `redo()`
- 役割: `redoStack` から取り消した状態を再適用し、画面を更新する。
- 引数: なし
- 戻り値: なし

#### `setInitialServer(p)`
- 役割: 初期サーバーを設定し、状態を保存する。
- 引数:
  - `p` (`number`): `1` または `2`
- 戻り値: なし

#### `doSwapCourts(options = {})`
- 役割: 選手名、スコア、セット数、色、初期サーバーを入れ替え、必要なら履歴・Undo を処理する。
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

---

## 5. 補足

- `script.js` の関数はすべて `window` グローバルスコープに公開され、`index.html` の `onclick` 属性から直接呼び出せる構成です。
- `styles.css` は関数を持ちませんが、`script.js` の状態変化を視覚的に反映するスタイルを提供します。
- `index.html` は UI 構造と `script.js` の関数呼び出しの接点を担います。
