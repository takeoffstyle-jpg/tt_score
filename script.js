        let state = { score1: 0, score2: 0, sets1: 0, sets2: 0, initialServer: null, history: [] };
        let undoStack = []; let redoStack = [];

        function saveToUndo() { undoStack.push(JSON.stringify(state)); }

        function updateUI() {
            document.getElementById('score1').innerText = state.score1;
            document.getElementById('score2').innerText = state.score2;
            document.getElementById('sets1').innerText = state.sets1;
            document.getElementById('sets2').innerText = state.sets2;
            const server = calculateServer();
            document.getElementById('zone1').classList.toggle('serving', server === 1);
            document.getElementById('zone2').classList.toggle('serving', server === 2);
            const historyDiv = document.getElementById('history');
            historyDiv.innerHTML = state.history.slice().reverse().map(h => 
                `<div class="history-item"><span>${h.time}</span><span>${h.msg}</span><span>${h.res}</span></div>`
            ).join('');
        }

        function calculateServer() {
            if (!state.initialServer) return null;
            const total = state.score1 + state.score2;
            const isDeuce = (state.score1 >= 10 && state.score2 >= 10);
            const interval = isDeuce ? 1 : 2;
            return (Math.floor(total / interval) % 2 === 0) ? state.initialServer : (3 - state.initialServer);
        }

        function addPoint(p) {
            saveToUndo(); redoStack = [];
            if (p === 1) state.score1++; else state.score2++;
            addLog(document.getElementById('name' + p).value + " 得点", `${state.score1}-${state.score2}`);
            checkSet(); updateUI();
        }

        function checkSet() {
            if ((state.score1 >= 11 || state.score2 >= 11) && Math.abs(state.score1 - state.score2) >= 2) {
                if (state.score1 > state.score2) state.sets1++; else state.sets2++;
                addLog("--- セット終了 ---", `${state.score1}-${state.score2}`);
                state.score1 = 0; state.score2 = 0;
                if (state.initialServer) state.initialServer = 3 - state.initialServer;
            }
        }

        function addLog(msg, res) {
            const now = new Date();
            const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
            state.history.push({ time, msg, res });
        }

        function undo() { if (undoStack.length) { redoStack.push(JSON.stringify(state)); state = JSON.parse(undoStack.pop()); updateUI(); } }
        function redo() { if (redoStack.length) { undoStack.push(JSON.stringify(state)); state = JSON.parse(redoStack.pop()); updateUI(); } }
        function setInitialServer(p) { saveToUndo(); state.initialServer = p; updateUI(); }
        function resetAll() { if (confirm("リセットしますか？")) { state = { score1: 0, score2: 0, sets1: 0, sets2: 0, initialServer: null, history: [] }; updateUI(); } }

        // --- 独自テキストフォーマットのセーブ・ロード ---

        function exportData() {
            const n1 = document.getElementById('name1').value;
            const n2 = document.getElementById('name2').value;
            
            // 人間が見やすいフォーマットを作成
            let txt = `[TT_SCORE_v3]\n`;
            txt += `PLAYERS|${n1}|${n2}\n`;
            txt += `SETS|${state.sets1}|${state.sets2}\n`;
            txt += `POINTS|${state.score1}|${state.score2}\n`;
            txt += `SERVER|${state.initialServer}\n`;
            txt += `HISTORY_START\n`;
            state.history.forEach(h => {
                txt += `${h.time},${h.msg},${h.res}\n`;
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
                    } else if (line.startsWith("SERVER")) {
                        state.initialServer = parts[1] === "null" ? null : parseInt(parts[1]);
                    } else if (line.startsWith("HISTORY_START")) {
                        inHistory = true;
                    } else if (line.startsWith("HISTORY_END")) {
                        inHistory = false;
                    } else if (inHistory) {
                        const hParts = line.split(",");
                        if (hParts.length === 3) {
                            newHistory.push({ time: hParts[0], msg: hParts[1], res: hParts[2] });
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

        updateUI();