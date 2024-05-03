# main.py

import mysql.connector
import json
import argparse
import random

# Parse command line arguments
parser = argparse.ArgumentParser(description="Generate questions based on tech stack and total questions.")
parser.add_argument("--techStack", type=str, help="Tech stack for questions")
parser.add_argument("--totalQuestions", type=int, help="Total number of questions")
parser.add_argument("--getTableNames", action="store_true", help="Fetch table names")
args = parser.parse_args()

# Connect to the MySQL database
con = mysql.connector.connect(
    user="root",
    password="Dhruvi@123",
    host="localhost",
    database="TechQuestions"  # Replace with the actual name of your database
)

cursor = con.cursor()

# Fetch table names and print them
if args.getTableNames:
    cursor.execute("SHOW TABLES")
    tables = [table[0] for table in cursor.fetchall()]
    print(json.dumps({"tableNames": tables}))
    exit()

# Validate command line arguments
tech_stack = args.techStack.lower() if args.techStack else None

if not tech_stack or not args.totalQuestions:
    print("Invalid arguments. Please provide tech stack and total number of questions.")
    exit()

# Fetch all available tech stacks from table names
cursor.execute("SHOW TABLES")
available_tech_stacks = [table[0].lower() for table in cursor.fetchall()]

# Validate tech stack input based on available table names
if tech_stack not in available_tech_stacks:
    print(f"Invalid tech stack. Please choose from: {', '.join(available_tech_stacks)}")
    exit()

# Define the desired distribution percentages
distribution_percentages = {"Easy": 0.33, "Medium": 0.5, "Hard": 0.17}

# Calculate the number of questions for each difficulty level
difficulty_counts = {level: round(distribution_percent * args.totalQuestions) for level, distribution_percent in distribution_percentages.items()}

questions = []

# Fetch questions for each difficulty level

for difficulty, count in difficulty_counts.items():
    query = f"SELECT * FROM {tech_stack} WHERE difficulty = %s"
    cursor.execute(query, (difficulty,))
    
    all_questions = cursor.fetchall()
    
    # Ensure that the count does not exceed the available questions
    count = min(count, len(all_questions))
    
    # Randomly sample the questions
    selected_questions = random.sample(all_questions, count)

    questions.extend(selected_questions)

# Sort the questions based on difficulty level (Easy -> Medium -> Hard)
sorted_questions = sorted(questions, key=lambda x: ("Easy", "Medium", "Hard").index(x[3]))

# Display the fetched questions
# Display the fetched questions
if sorted_questions:
    result = [
        {
            "question_id": question[0],
            "question_text": question[1],
            "answer_text": question[2],
            "difficulty_level": question[3],
        }
        for question in sorted_questions[:args.totalQuestions]
    ]
    print(json.dumps(result))
else:
    print("No questions found for the specified tech stack and difficulty levels.")


# Close the cursor and connection
cursor.close()
con.close()