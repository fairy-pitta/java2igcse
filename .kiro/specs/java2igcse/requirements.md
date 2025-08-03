# Requirements Document

## Introduction

java2igcseは、教育関係者がJavaやTypeScriptのコードをIGCSE（International General Certificate of Secondary Education）準拠のpseudocodeに変換するためのnpmライブラリです。このライブラリは、プログラミング教育において、実際のコードを学習者にとって理解しやすいpseudocode形式に翻訳することを目的としています。

## Requirements

### Requirement 1

**User Story:** As an educator, I want to convert Java code to IGCSE pseudocode, so that I can provide students with standardized pseudocode examples that follow IGCSE curriculum guidelines.

#### Acceptance Criteria

1. WHEN a valid Java code snippet is provided THEN the system SHALL parse the Java syntax and convert it to IGCSE pseudocode format
2. WHEN the Java code contains control structures (if/else, loops, functions) THEN the system SHALL convert them to their IGCSE pseudocode equivalents
3. WHEN the Java code contains data types and variables THEN the system SHALL convert them to IGCSE pseudocode variable declarations
4. IF the Java code contains syntax errors THEN the system SHALL return an error message indicating the parsing failure

### Requirement 2

**User Story:** As an educator, I want to convert TypeScript code to IGCSE pseudocode, so that I can translate modern web development concepts into curriculum-appropriate pseudocode.

#### Acceptance Criteria

1. WHEN a valid TypeScript code snippet is provided THEN the system SHALL parse the TypeScript syntax and convert it to IGCSE pseudocode format
2. WHEN the TypeScript code contains type annotations THEN the system SHALL convert them to appropriate IGCSE pseudocode variable declarations
3. WHEN the TypeScript code contains ES6+ features (arrow functions, classes, modules) THEN the system SHALL convert them to equivalent IGCSE pseudocode structures
4. IF the TypeScript code contains unsupported features THEN the system SHALL provide warnings while converting supported portions

### Requirement 3

**User Story:** As a developer integrating this library, I want a simple API interface, so that I can easily incorporate the conversion functionality into my educational tools.

#### Acceptance Criteria

1. WHEN I import the library THEN the system SHALL provide a clear API with convert functions for both Java and TypeScript
2. WHEN I call the conversion function with source code THEN the system SHALL return the converted pseudocode as a string
3. WHEN I need to configure conversion options THEN the system SHALL accept optional configuration parameters
4. IF an error occurs during conversion THEN the system SHALL throw descriptive error messages

### Requirement 4

**User Story:** As an educator, I want the pseudocode output to follow IGCSE standards, so that students learn the correct pseudocode syntax expected in their examinations.

#### Acceptance Criteria

1. WHEN code is converted THEN the system SHALL use IGCSE-compliant pseudocode keywords (BEGIN/END, IF/THEN/ELSE/ENDIF, WHILE/ENDWHILE, etc.)
2. WHEN variables are declared THEN the system SHALL use IGCSE pseudocode variable declaration syntax
3. WHEN functions are converted THEN the system SHALL use IGCSE pseudocode procedure/function syntax with proper parameter handling
4. WHEN arrays and data structures are converted THEN the system SHALL use IGCSE pseudocode array notation

### Requirement 5

**User Story:** As a developer, I want comprehensive documentation and examples, so that I can understand how to use the library effectively in my educational applications.

#### Acceptance Criteria

1. WHEN I access the library documentation THEN the system SHALL provide clear usage examples for both Java and TypeScript conversion
2. WHEN I need to understand conversion rules THEN the system SHALL provide documentation explaining how different code constructs are mapped to pseudocode
3. WHEN I encounter issues THEN the system SHALL provide troubleshooting guides and common error solutions
4. IF I want to extend the library THEN the system SHALL provide developer documentation for contributing new features

### Requirement 6

**User Story:** As an educator, I want to handle common programming constructs accurately, so that the converted pseudocode maintains the logical flow and structure of the original code.

#### Acceptance Criteria

1. WHEN the code contains nested control structures THEN the system SHALL maintain proper indentation and structure in the pseudocode output
2. WHEN the code contains method calls THEN the system SHALL convert them to appropriate pseudocode procedure calls
3. WHEN the code contains object-oriented features THEN the system SHALL convert them to procedural pseudocode equivalents where possible
4. IF the code contains complex features that don't translate directly THEN the system SHALL provide comments explaining the conversion approach