document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    document.getElementById('runButton').addEventListener('click', compileAndRun);
//lexing phase 
    function lexer(input) {
        const tokens = [];
        let position = 0;

        while (position < input.length) {
            let char = input[position];

            if (/\s/.test(char)) {
                position++;
                continue;
            }
// this is useful
            if (char === '"') {
                position++;
                let text = '';
                while (position < input.length && input[position] !== '"') {
                    text += input[position++];
                }
                if (position >= input.length) throw new SyntaxError('Unterminated string literal');
                position++; // consume closing "
                tokens.push({ type: 'string', value: text });
                continue;
            }

            if (/[a-zA-Z]/.test(char)) {
                let word = '';
                while (position < input.length && /[a-zA-Z]/.test(input[position])) {
                    word += input[position++];
                }
                tokens.push({
                    type: ['maano', 'likho', 'agar', 'warna', 'jabtak'].includes(word) ? 'keyword' : 'identifier',
                    value: word
                });
                continue;
            }

            if (/\d/.test(char)) {
                let number = '';
                while (position < input.length && /\d/.test(input[position])) {
                    number += input[position++];
                }
                tokens.push({ type: 'number', value: parseInt(number, 10) });
                continue;
            }

            if (/[\+\-\*\/=<>!]/.test(char)) {
                if (input[position + 1] === '=') {
                    tokens.push({ type: 'operator', value: char + input[++position] });
                    position++;
                } else {
                    tokens.push({ type: 'operator', value: char });
                    position++;
                }
                continue;
            }

            if (char === '{' || char === '}') {
                tokens.push({ type: 'brace', value: char });
                position++;
                continue;
            }

            throw new SyntaxError(`Unexpected character: '${char}' at position ${position}`);
        }

        return tokens;
    }

    function parseExpression(tokens) {
        const expr = [];
        while (tokens.length > 0) {
            const token = tokens[0];
            if (['string', 'identifier', 'number'].includes(token.type) || (token.type === 'operator' && ['+', '-', '*', '/'].includes(token.value))) {
                expr.push(tokens.shift());
            } else {
                break;
            }
        }
        if (expr.length === 0) throw new SyntaxError('Expected expression but found none.');
        return expr;
    }

    function stringifyExpression(exprTokens) {
        return exprTokens.map(t => {
            if (t.type === 'string') return `"${t.value}"`;
            return t.value;
        }).join(' ');
    }

    function parser(tokens) {
        const ast = { type: 'program', body: [] };

        function parseBlock() {
            const body = [];
            while (tokens.length > 0 && tokens[0].value !== '}') {
                const stmt = parseStatement();
                if (stmt) body.push(stmt);
                else break;
            }
            if (tokens.length === 0 || tokens[0].value !== '}') throw new SyntaxError('Expected } to close block');
            tokens.shift(); // consume '}'
            return body;
        }

        function parseStatement() {
            if (tokens.length === 0) return null;
            const token = tokens.shift();

            if (token.type === 'keyword' && token.value === 'maano') {
                const identifier = tokens.shift();
                if (!identifier || identifier.type !== 'identifier') throw new SyntaxError('Expected identifier after "maano".');
                if (!tokens[0] || tokens[0].value !== '=') throw new SyntaxError('Expected "=" after variable name.');
                tokens.shift(); // consume '='
                return { type: 'declaration', name: identifier.value, valueTokens: parseExpression(tokens) };
            }

            if (token.type === 'identifier') {
                if (!tokens[0] || tokens[0].value !== '=') throw new SyntaxError(`Expected "=" after identifier "${token.value}"`);
                tokens.shift(); // consume '='
                return { type: 'assignment', name: token.value, valueTokens: parseExpression(tokens) };
            }

            if (token.type === 'keyword' && token.value === 'likho') {
                return { type: 'print', valueTokens: parseExpression(tokens) };
            }

            if (token.type === 'keyword' && token.value === 'agar') {
                const left = tokens.shift();
                const op = tokens.shift();
                const right = tokens.shift();
                if (!left || !op || !right) throw new SyntaxError('Invalid condition in agar');

                if (!tokens[0] || tokens[0].value !== '{') throw new SyntaxError('Expected { after condition');
                tokens.shift(); // consume '{'
                const body = parseBlock();

                let elseBody = [];
                if (tokens.length > 0 && tokens[0].value === 'warna') {
                    tokens.shift(); // consume 'warna'
                    if (!tokens[0] || tokens[0].value !== '{') throw new SyntaxError('Expected { after warna');
                    tokens.shift(); // consume '{'
                    elseBody = parseBlock();
                }

                return {
                    type: 'conditional',
                    condition: { left, operator: op.value, right },
                    body,
                    elseBody,
                };
            }

            if (token.type === 'keyword' && token.value === 'jabtak') {
                const left = tokens.shift();
                const op = tokens.shift();
                const right = tokens.shift();
                if (!left || !op || !right) throw new SyntaxError('Invalid condition in jabtak');

                if (!tokens[0] || tokens[0].value !== '{') throw new SyntaxError('Expected { after jabtak condition');
                tokens.shift(); // consume '{'
                const body = parseBlock();

                return {
                    type: 'loop',
                    condition: { left, operator: op.value, right },
                    body,
                };
            }

            throw new SyntaxError(`Unexpected token "${token.value}"`);
        }

        while (tokens.length > 0) {
            const stmt = parseStatement();
            if (stmt) ast.body.push(stmt);
        }

        return ast;
    }

    function generate(node, language, indentLevel = 0) {
        const indent = (lvl) => '    '.repeat(lvl);

        switch (node.type) {
            case 'program':
                return node.body.map(s => generate(s, language, indentLevel)).join('\n');

            case 'declaration':
            case 'assignment': {
                const val = stringifyExpression(node.valueTokens);
                const stmt = `${node.name} = ${val}`;
                if (language === 'python') return `${indent(indentLevel)}${stmt}`;
                if (['c', 'cpp', 'java'].includes(language) && node.type === 'declaration')
                    return `${indent(indentLevel)}int ${stmt};`;
                return `${indent(indentLevel)}${stmt};`;
            }

            case 'print': {
                const val = stringifyExpression(node.valueTokens);
                if (language === 'python') return `${indent(indentLevel)}print(${val})`;
                if (language === 'js') return `${indent(indentLevel)}console.log(${val});`;
                if (language === 'cpp') return `${indent(indentLevel)}std::cout << ${val} << std::endl;`;
                if (language === 'java') return `${indent(indentLevel)}System.out.println(${val});`;
                if (language === 'c') {
                    if (node.valueTokens.length === 1 && node.valueTokens[0].type === 'string')
                        return `${indent(indentLevel)}printf("${node.valueTokens[0].value}\\n");`;
                    return `${indent(indentLevel)}printf("%d\\n", ${val});`;
                }
                return '';
            }

            case 'conditional': {
                const { left, operator, right } = node.condition;
                const cond = `${left.value} ${operator} ${right.value}`;
                const ifBody = node.body.map(s => generate(s, language, indentLevel + 1)).join('\n');
                const elseBody = node.elseBody.map(s => generate(s, language, indentLevel + 1)).join('\n');

                if (language === 'python') {
                    return `${indent(indentLevel)}if ${cond}:\n${ifBody}${elseBody ? `\n${indent(indentLevel)}else:\n${elseBody}` : ''}`;
                } else {
                    return `${indent(indentLevel)}if (${cond}) {\n${ifBody}\n${indent(indentLevel)}}${elseBody ? ` else {\n${elseBody}\n${indent(indentLevel)}}` : ''}`;
                }
            }

            case 'loop': {
                const { left, operator, right } = node.condition;
                const cond = `${left.value} ${operator} ${right.value}`;
                const body = node.body.map(s => generate(s, language, indentLevel + 1)).join('\n');

                if (language === 'python') return `${indent(indentLevel)}while ${cond}:\n${body}`;
                return `${indent(indentLevel)}while (${cond}) {\n${body}\n${indent(indentLevel)}}`;
            }

            default:
                throw new Error('Unknown node type: ' + node.type);
        }
    }

    function compileAndRun() {
        const input = document.getElementById('codeInput').value;
        const outputElement = document.getElementById('output');
        const convertedCodeElement = document.getElementById('convertedCode');
        const language = document.getElementById('languageSelect').value;

        try {
            const tokens = lexer(input);
            const ast = parser(tokens);
            const jsCode = generate(ast, 'js');
            const convertedCode = generate(ast, language);
            convertedCodeElement.textContent = convertedCode;

            const safeDivFunction = `
function safeDiv(a, b) {
    if (b === 0) throw new Error("Division by zero is not allowed.");
    return a / b;
}
`;
            const safeJsCode = safeDivFunction + '\n' + jsCode.replace(/(\w+)\s*\/\s*(\w+)/g, 'safeDiv($1, $2)');

            let consoleOutput = '';
            const originalLog = console.log;
            console.log = (...args) => {
                consoleOutput += args.join(' ') + '\n';
                originalLog(...args);
            };

            try {
                eval(safeJsCode);
            } catch (err) {
                consoleOutput = 'Runtime Error: ' + err.message;
            }

            console.log = originalLog;
            outputElement.textContent = consoleOutput.trim();
            document.querySelector('[data-tab="output"]').click();
        } catch (err) {
            outputElement.textContent = 'Error: ' + err.message;
            convertedCodeElement.textContent = '';
            document.querySelector('[data-tab="output"]').click();
        }
    }
});
