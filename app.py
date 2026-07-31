from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


class Solution:

    def solveSudoku(self, board):

        def is_valid(row, col, num):

            for j in range(9):
                if board[row][j] == num:
                    return False

            for i in range(9):
                if board[i][col] == num:
                    return False

            start_row = (row // 3) * 3
            start_col = (col // 3) * 3

            for i in range(start_row, start_row + 3):
                for j in range(start_col, start_col + 3):

                    if board[i][j] == num:
                        return False

            return True

        def solve():

            for row in range(9):
                for col in range(9):

                    if board[row][col] == ".":

                        for num in "123456789":

                            if is_valid(row, col, num):

                                board[row][col] = num

                                if solve():
                                    return True

                                board[row][col] = "."

                        return False

            return True

        return solve()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/solve", methods=["POST"])
def solve():

    data = request.get_json()

    board = data["board"]

    solver = Solution()

    solved = solver.solveSudoku(board)

    return jsonify({
        "solved": solved,
        "board": board
    })


if __name__ == "__main__":
    app.run(debug=True)