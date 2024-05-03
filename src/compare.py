# compare.py
import sys
import openai

def compare_responses(user_response, correct_answer, question_text):
    prompt = f"give a very brief feedback of under 20 words for answer that user gave {user_response} , for the {question_text} to that of {correct_answer}, you also need to strictly score user's response out of 10 which should strongly depend on how much relevant is user's response : {user_response} to that of question: {question_text} , irrelavant answers should stritcly be scored 0  ,  only complete satisfactory answers should be scored above 7. and score should only be given in the format score: "

    # Set your OpenAI API key
    openai.api_key = 'your-api-key'

    # Use the GPT-3.5 model to generate a comparison
    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt=prompt,
        max_tokens=100,  #1000token = 750 words 
        temperature=0.7,  #randomness or creativity
        stop=None
    )

    result = response.choices[0].text.strip().lower()

    print(f"Result: {result}")

    return result

if __name__ == "__main__":
    # Check if enough command-line arguments are provided
    if len(sys.argv) != 4:
        print("Usage: python compare.py <user_response> <correct_answer> <question_text>")
        sys.exit(1)

    # Extract command-line arguments
    user_response = sys.argv[1]
    correct_answer = sys.argv[2]
    question_text = sys.argv[3]

    # Call the comparison function
    result = compare_responses(user_response, correct_answer, question_text)

