Custom Language Compiler Web Application
Overview
This web application is a custom language compiler that transforms code written in a simple custom programming language into several popular programming languages including JavaScript, Python, Java, C++, and C. The application provides a user-friendly interface for writing, translating, and executing code.

Features
Custom Language Syntax: Supports keywords like maano (declare), likho (print), agar (if), warna (else), and jabtak (while)

Multi-language Translation: Convert code to JavaScript, Python, Java, C++, or C

Interactive Execution: Run code directly in the browser and see the output

Comprehensive Documentation: Built-in reference for the custom language syntax

Responsive Design: Works on both desktop and mobile devices

Syntax Highlighting: Clean presentation of input and output code

How It Works
The application implements a complete compiler pipeline:

Lexical Analysis: Breaks down input code into tokens

Parsing: Constructs an Abstract Syntax Tree (AST) from the tokens

Code Generation: Converts the AST to target language code

Execution: Optionally runs the generated JavaScript code in a sandboxed environment

Built With
HTML5, CSS3, JavaScript (Vanilla JS - no frameworks)

Google Fonts (Poppins and Fira Code)

Modern CSS features like Flexbox and Grid

Clean, intuitive UI with animations and responsive design

Getting Started
Clone the repository

Open index.html in a web browser

Write code in the custom language in the input area

Select a target language from the dropdown

Click "Run Code" to see the translation and execution output

Example Code
maano x = 10
agar x > 5 {
    likho "x is greater than 5"
} warna {
    likho "x is 5 or less"
}

jabtak x > 0 {
    likho x
    x = x - 1
}
Documentation
The application includes built-in documentation explaining all language features:

Variable declaration with maano

Printing output with likho

Conditional statements with agar and warna

Loops with jabtak

Supported operators and expressions

Contribution
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.