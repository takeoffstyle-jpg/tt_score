        let state = {
            score1: 0, score2: 0,
            sets1: 0, sets2: 0,
            initialServer: null,
            scorer: null,
            player1:"選手A",
            player2:"選手B",
            playSide: 1, // 1=左側がプレイヤー1、2=右側がプレイヤー1
            player1Color: '#ffebee',
            player2Color: '#e3f2fd',
            history: []
        };
        let undoStack = []; let redoStack = [];

        // フリック検出用の状態管理
        let touchState = { startX: 0, startY: 0, startTime: 0, player: null, longPressTimer: null, isFlick: false };

        function saveToUndo() { undoStack.push(JSON.stringify(state)); }

        function updateUI() {
            document.getElementById('score1').innerText = state.score1;
            document.getElementById('score2').innerText = state.score2;
            document.getElementById('sets1').innerText = state.sets1;
            document.getElementById('sets2').innerText = state.sets2;
            document.getElementById('name1').innerText = state.player1;
            document.getElementById('name2').innerText = state.player2;
            const zone1 = document.getElementById('zone1');
            const zone2 = document.getElementById('zone2');
            zone1.style.backgroundColor = state.player1Color;
            zone2.style.backgroundColor = state.player2Color;
            const accent1 = getAccentColor(state.player1Color);
            const accent2 = getAccentColor(state.player2Color);
            const btn1 = zone1.querySelector('.add-btn');
            const btn2 = zone2.querySelector('.add-btn');
            btn1.style.backgroundColor = accent1;
            btn2.style.backgroundColor = accent2;
            btn1.style.color = getTextColor(accent1);
            btn2.style.color = getTextColor(accent2);
            const server = calculateServer();
            zone1.classList.toggle('serving', server === 1);
            zone2.classList.toggle('serving', server === 2);
            const historyDiv = document.getElementById('history');
            // strがnull/undefinedなら空文字に変換し、文字列としてパディングする
            const p = (str, len) => {
                const s = (str !== null && str !== undefined) ? String(str) : "";
                return s.padEnd(len, " ");
            };
            historyDiv.innerHTML = state.history.slice().reverse().map(h => {
                let scorer, player1, player2;
                
                scorer = (state.playSide === h.scorer) ? 1 : 2;
                if (scorer==1){
                    player1 = state.player1;
                    player2 = '';
                }else{
                    player1 = '';
                    player2 = state.player2;
                }
                if(h.scorer){
                    return `<div class="history-item">
                    <span>${p(h.time,8)}</span>
                    <span>${p(player1,5)}</span>
                    <span>${p(player2,5)}</span>
                    <span>${p(h.action1,3)}</span>
                    <span>${p(h.action2,4)}</span>
                    <span>${p(h.action3,10)}</span>
                    <span>${p(`${h.res}`,5)}</span>
                    </div>`;
                }else{
                    return `<div class="history-item"><span>${h.time}</span><span>${h.msg}</span><span>${h.res}</span></div>`;
                }
            }).join('');
            closePalettes();
        }

        function calculateServer() {
            if (!state.initialServer) return null;
            const total = state.score1 + state.score2;
            const isDeuce = (state.score1 >= 10 && state.score2 >= 10);
            const interval = isDeuce ? 1 : 2;
            return (Math.floor(total / interval) % 2 === 0) ? state.initialServer : (3 - state.initialServer);
        }

        function hexToRgb(hex) {
            const cleaned = hex.replace('#', '');
            const value = cleaned.length === 3 ? cleaned.split('').map(ch => ch + ch).join('') : cleaned;
            const num = parseInt(value, 16);
            return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
        }

        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
                    case g: h = ((b - r) / d + 2); break;
                    case b: h = ((r - g) / d + 4); break;
                }
                h /= 6;
            }
            return { h, s, l };
        }

        function hslToHex(h, s, l) {
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            const toHex = x => {
                const hex = Math.round(x * 255).toString(16).padStart(2, '0');
                return hex;
            };
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        function getAccentColor(hex) {
            const { h, s, l } = rgbToHsl(...Object.values(hexToRgb(hex)));
            const targetL = Math.max(0, Math.min(1, l - 0.18));
            const adjustedS = Math.min(1, s + 0.05);
            return hslToHex(h, adjustedS, targetL);
        }

        function getTextColor(hex) {
            const { r, g, b } = hexToRgb(hex);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.6 ? '#222222' : '#ffffff';
        }

        function addPoint(p) {
            if (document.getElementById('action-menu')) return; // メニュー表示中は通常得点を無効（重複防止）
            saveToUndo(); redoStack = [];
            if (p === 1){
                state.score1++;
                state.scorer = 1;
            }else{
                state.score2++;
                state.scorer = 2;
             }
            scorerName = p === 1 ? state.player1 : state.player2;
            state.scorer = (state.playSide === p) ? 1 : 2; // コートチェンジしても不変なScorer
            addLog(scorerName + " 得点", `${state.score1}-${state.score2}`, state.scorer);
            
            checkSet(); updateUI();
        }

        function checkSet() {
            if ((state.score1 >= 11 || state.score2 >= 11) && Math.abs(state.score1 - state.score2) >= 2) {
                if (state.score1 > state.score2) state.sets1++; else state.sets2++;
                addLog("--- セット終了 ---", `${state.score1}-${state.score2}`);
                state.score1 = 0; state.score2 = 0;
                if (state.initialServer) state.initialServer = 3 - state.initialServer;
                doSwapCourts({ skipUndo: true, skipLog: true });
                addLog("自動コートチェンジ", `${state.score1}-${state.score2}`);
            }
        }

        function togglePalette(player) {
            closePalettes();
            const palette = document.getElementById('palette' + player);
            palette.classList.toggle('show');
        }

        function closePalettes() {
            [1, 2].forEach(n => document.getElementById('palette' + n).classList.remove('show'));
        }

        function selectPlayerColor(player, color) {
            saveToUndo(); redoStack = [];
            state['player' + player + 'Color'] = color;
            closePalettes();
            addLog(`選手${player}カラー変更`, color);
            updateUI();
        }

        function addLog(msg, res, scorer=null, action1 = null, action2 = null, action3 = null) {
            const now = new Date();
            const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
            const entry = { time, msg, res };
            if (scorer) entry.scorer = scorer;  // A=選手A, B=選手B
            if (action1) entry.action1 = action1;  // 技術: 'Atk' or 'Def' or 'Pas'
            if (action2) entry.action2 = action2;  // ラバー面: 'Fore' or 'Back' or '?'
            if (action3) entry.action3 = action3;  // 第2選択結果: NT / 2B / T-Own / T-Out / Miss / Unknown
            state.history.push(entry);
        }

        function undo() { if (undoStack.length) { redoStack.push(JSON.stringify(state)); state = JSON.parse(undoStack.pop()); updateUI(); } }
        function redo() { if (redoStack.length) { undoStack.push(JSON.stringify(state)); state = JSON.parse(redoStack.pop()); updateUI(); } }
        function setInitialServer(p) { saveToUndo(); state.initialServer = p; updateUI(); }
        function doSwapCourts(options = {}) {
            if (!options.skipUndo) {
                saveToUndo(); redoStack = [];
            }
            const n1 = document.getElementById('name1').value;
            const n2 = document.getElementById('name2').value;
            document.getElementById('name1').value = n2;
            document.getElementById('name2').value = n1;
            [state.score1, state.score2] = [state.score2, state.score1];
            [state.sets1, state.sets2] = [state.sets2, state.sets1];
            [state.player1, state.player2] = [state.player2, state.player1];
            [state.player1Color, state.player2Color] = [state.player2Color, state.player1Color];
            state.playSide = 3 - state.playSide; // コートチェンジでプレイサイドも反転
            if (state.initialServer) state.initialServer = 3 - state.initialServer;
            if (!options.skipLog) {
                addLog('コートチェンジ', `${state.score1}-${state.score2}`);
            }
            updateUI();
        }
        function swapCourts() {
            doSwapCourts();
        }
        function resetAll() { if (confirm("リセットしますか？")) { state = { score1: 0, score2: 0, sets1: 0, sets2: 0, initialServer: null, player1Color: '#ffebee', player2Color: '#e3f2fd', history: [] }; closeActionMenu(); closeFlickGuide(); updateUI(); } }

        // --- 独自テキストフォーマットのセーブ・ロード ---

        function exportData() {
            const n1 = document.getElementById('name1').value;
            const n2 = document.getElementById('name2').value;
            
            // 存在しない時は、””をに変えるhelper関数
            const p = (str) => {
                return (str !== null && str !== undefined) ? String(str) : "";
            };
            // 人間が見やすいフォーマットを作成
            let txt = `[TT_SCORE_v3]\n`;
            txt += `PLAYERS|${n1}|${n2}\n`;
            txt += `COLORS|${state.player1Color}|${state.player2Color}\n`;
            txt += `SETS|${state.sets1}|${state.sets2}\n`;
            txt += `POINTS|${state.score1}|${state.score2}\n`;
            txt += `SERVER|${state.initialServer}\n`;
            txt += `HISTORY_START\n`;
            state.history.forEach(h => {
                // 全てp関数で存在しない値を空文字に変換してから、カンマ区切りで保存
                txt += `${p(h.time)},${p(h.msg)},${p(h.res)},${p(h.scorer)},${p(h.action1)},${p(h.action2)},${p(h.action3)}\n`;
            });
            txt += `HISTORY_END`;

            // クリップボードにコピー
            const textArea = document.createElement("textarea");
            textArea.value = txt;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            
            alert("独自形式のテキストをクリップボードにコピーしました！\nこれをLINEやメモ帳に貼り付けて保存してください。");
        }

        function importData() {
            const input = prompt("保存したテキストをここに貼り付けてください:");
            if (!input || !input.includes("[TT_SCORE_v3]")) {
                alert("有効なデータではありません");
                return;
            }

            try {
                const lines = input.split("\n");
                let newHistory = [];
                let inHistory = false;

                lines.forEach(line => {
                    const parts = line.split("|");
                    if (line.startsWith("PLAYERS")) {
                        document.getElementById('name1').value = parts[1];
                        document.getElementById('name2').value = parts[2];
                    } else if (line.startsWith("SETS")) {
                        state.sets1 = parseInt(parts[1]);
                        state.sets2 = parseInt(parts[2]);
                    } else if (line.startsWith("POINTS")) {
                        state.score1 = parseInt(parts[1]);
                        state.score2 = parseInt(parts[2]);
                    } else if (line.startsWith("COLORS")) {
                        state.player1Color = parts[1] || '#ffebee';
                        state.player2Color = parts[2] || '#e3f2fd';
                    } else if (line.startsWith("SERVER")) {
                        state.initialServer = parts[1] === "null" ? null : parseInt(parts[1]);
                    } else if (line.startsWith("HISTORY_START")) {
                        inHistory = true;
                    } else if (line.startsWith("HISTORY_END")) {
                        inHistory = false;
                    } else if (inHistory) {
                        const hParts = line.split(",");
                        if (hParts.length === 7) {
                            newHistory.push({
                                time: hParts[0],
                                msg: hParts[1],
                                res: hParts[2],
                                scorer: parseInt(hParts[3]),
                                action1: hParts[4],
                                action2: hParts[5],
                                action3: hParts[6]
                            });
                        }
                    }
                });
                state.history = newHistory;
                updateUI();
                alert("読み込みが完了しました！");
            } catch (e) {
                alert("読み込み中にエラーが発生しました");
            }
        }

        // フリック検出: 8方向判定
        function detectFlickDirection(startX, startY, endX, endY, isPlayer2) {
            let dx = endX - startX;
            let dy = endY - startY;
            
            // プレイヤー2は左右反転（内側が攻め、外側が守り）
            if (isPlayer2) dx = -dx;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 30) return null; // 最小フリック距離
            
            const rawAngle = Math.atan2(dy, dx) * 180 / Math.PI; // 0度=右、90度=下、-90度=上
            const angle = rawAngle < 0 ? rawAngle + 360 : rawAngle;
            const octant = Math.floor((angle + 22.5) / 45) % 8;
            
            let direction = null, action = null, rubberFace = null;
            switch (octant) {
                case 0: // 右
                    direction = 'right';
                    action = 'Atk';
                    rubberFace = '?';
                    break;
                case 1: // 右下
                    direction = 'downright';
                    action = 'Atk';
                    rubberFace = 'Back';
                    break;
                case 2: // 下
                    direction = 'down';
                    action = 'Pas';
                    rubberFace = 'Back';
                    break;
                case 3: // 左下
                    direction = 'downleft';
                    action = 'Def';
                    rubberFace = 'Back';
                    break;
                case 4: // 左
                    direction = 'left';
                    action = 'Def';
                    rubberFace = '?';
                    break;
                case 5: // 左上
                    direction = 'upleft';
                    action = 'Def';
                    rubberFace = 'Fore';
                    break;
                case 6: // 上
                    direction = 'up';
                    action = 'Pas';
                    rubberFace = 'Fore';
                    break;
                case 7: // 右上
                    direction = 'upright';
                    action = 'Atk';
                    rubberFace = 'Fore';
                    break;
            }
            
            return { direction, action, rubberFace, angle: Math.round(angle * 10) / 10 };
        }

        // メニュー表示
        function showActionMenu(endX, endY, player, flickResult) {
            closeActionMenu();
            
            const menu = document.createElement('div');
            menu.id = 'action-menu';
            menu.className = 'action-menu';
            menu.style.left = '50%';
            menu.style.top = '50%';
            menu.style.transform = 'translate(-50%, -50%)';
            
            const actions = [
                { label: 'ノータッチ', value: 'NoTouch' },
                { label: '２バウンド', value: '2Bounce' },
                { label: 'タッチ自陣', value: 'TouchOwn' },
                { label: 'タッチアウト', value: 'TouchOut' },
                { label: '空振り', value: 'Miss' },
                { label: '不明', value: 'Unknown' }
            ];
            
            let html = '<div class="flick-info">技術: ' + (flickResult.action || '?') + ' / 面: ' + (flickResult.rubberFace || '?') + '</div>';
            html += '<div class="menu-buttons">';
            actions.forEach(a => {
                html += `<button onclick="selectAction(${player}, '${a.value}')">${a.label}</button>`;
            });
            html += '</div>';
            
            menu.innerHTML = html;
            document.body.appendChild(menu);
            window.currentFlickPlayer = player;
            window.lastFlickInfo = flickResult;
            
            // 背景をタップでメニュー閉じる
            setTimeout(() => {
                document.addEventListener('click', closeActionMenuOnBgClick);
            }, 10);
        }

        function closeActionMenuOnBgClick(e) {
            if (!e.target.closest('#action-menu')) {
                if (window.currentFlickPlayer && window.lastFlickInfo) {
                    commitFlickWithoutResult(window.currentFlickPlayer);
                }
                closeActionMenu();
                document.removeEventListener('click', closeActionMenuOnBgClick);
            }
        }

        function closeActionMenu() {
            const menu = document.getElementById('action-menu');
            if (menu) menu.remove();
        }

        function selectAction(player, action2Value) {
            const flickInfo = window.lastFlickInfo;
            if (!flickInfo) return;
            
            const playerName = document.getElementById('name' + player).value;
            const resultLabel = {
                NoTouch: 'NT',
                '2Bounce': '2B',
                TouchOwn: 'T-Own',
                TouchOut: 'T-Out',
                Miss: 'Miss',
                Unknown: 'Unknown'
            }[action2Value] || action2Value;
            const msg = playerName + ' 得点 [' + flickInfo.action + (flickInfo.rubberFace ? '・' + flickInfo.rubberFace : '') + ']';
            
            saveToUndo(); redoStack = [];
            state['score' + player]++;
            // コートチェンジしても不変なScorer
           state.scorer = (state.playSide === player) ? 1 : 2;

            addLog(msg, `${state.score1}-${state.score2}`, state.scorer, flickInfo.action, flickInfo.rubberFace, resultLabel);
            checkSet(); 
            closeActionMenu();
            window.currentFlickPlayer = null;
            window.lastFlickInfo = null;
            updateUI();
        }

        function commitFlickWithoutResult(player) {
            const flickInfo = window.lastFlickInfo;
            if (!flickInfo) return;
            const playerName = document.getElementById('name' + player).value;
            const msg = playerName + ' 得点 [' + flickInfo.action + (flickInfo.rubberFace ? '・' + flickInfo.rubberFace : '') + ']';
            saveToUndo(); redoStack = [];
            state['score' + player]++;
            state.scorer = (state.playSide === player) ? 1 : 2;
            addLog(msg, `${state.score1}-${state.score2}`, state.scorer, flickInfo.action, flickInfo.rubberFace, null);
            checkSet();
            window.currentFlickPlayer = null;
            window.lastFlickInfo = null;
            updateUI();
        }

        // タッチイベントハンドラ初期化
        function initTouchHandlers() {
            [1,2].forEach(player=> {
                const addbtn = document.getElementById('add-btn' + player);
                if (!addbtn) return;
                
                addbtn.addEventListener('touchstart', e => {
                    touchState.startX = e.touches[0].clientX;
                    touchState.startY = e.touches[0].clientY;
                    touchState.startTime = Date.now();
                    touchState.player = player;
                    touchState.isFlick = false;
                    closeActionMenu();
                    
                    // 長押し検出（1秒後にガイド表示）
                    touchState.longPressTimer = setTimeout(() => {
                        if (!touchState.isFlick) {
                            showFlickGuide(player, touchState.startX, touchState.startY);
                        }
                    }, 1000);
                });
                
                addbtn.addEventListener('touchmove', e => {
                    if (touchState.startX === null) return;
                    clearTimeout(touchState.longPressTimer);
                    touchState.isFlick = true;
                });
                
                addbtn.addEventListener('touchend', e => {
                    clearTimeout(touchState.longPressTimer);
                    
                    const endX = e.changedTouches[0].clientX;
                    const endY = e.changedTouches[0].clientY;
                    const duration = Date.now() - touchState.startTime;
                    
                    // タップ判定（移動距離<30px、時間<200ms）
                    const dx = endX - touchState.startX;
                    const dy = endY - touchState.startY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const isQuickTap = distance < 30 && duration < 200 && !touchState.isFlick;
                    
                    if (isQuickTap) {
                        // 通常の得点
                        addPoint(player);
                    } else if (touchState.isFlick && distance > 30) {
                        // フリック検出
                        const flickResult = detectFlickDirection(touchState.startX, touchState.startY, endX, endY, player === 2);
                        if (flickResult) {
                            window.lastFlickInfo = flickResult;
                            showActionMenu(endX, endY, player, flickResult);
                        }
                    }
                    
                    touchState.startX = 0;
                    touchState.startY = 0;
                    touchState.isFlick = false;
                });
            });
        }

        // フリックガイド表示（長押し時）
        function showFlickGuide(player, x, y) {
            closeFlickGuide();
            
            const guide = document.createElement('div');
            guide.id = 'flick-guide';
            guide.className = 'flick-guide';
            guide.style.left = (x - 112) + 'px'; // 224/2 = 112
            guide.style.top = (y - 112) + 'px';
            
            const directions = [
                { label: 'F守', class: 'def' }, // upleft
                { label: 'F続', class: 'pas' }, // up
                { label: 'F攻', class: 'atk' }, // upright
                { label: '守', class: 'def' },  // left
                { label: '攻', class: 'atk' },  // right
                { label: 'B攻', class: 'atk' }, // downright
                { label: 'B続', class: 'pas' }, // down
                { label: 'B守', class: 'def' }  // downleft
            ];
            
            directions.forEach(d => {
                const item = document.createElement('div');
                item.className = `guide-item ${d.class}`;
                item.textContent = d.label;
                guide.appendChild(item);
            });
            
            document.body.appendChild(guide);
            
            setTimeout(() => closeFlickGuide(), 2000);
        }

        function closeFlickGuide() {
            const guide = document.getElementById('flick-guide');
            if (guide) guide.remove();
        }

        document.addEventListener('click', event => {
            if (!event.target.closest('.color-icon') && !event.target.closest('.color-palette')) {
                closePalettes();
            }
        });

        // タッチハンドラ初期化
        initTouchHandlers();
        updateUI();