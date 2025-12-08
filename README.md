# Terminal Snake Game

A simple terminal-based Snake game built with Python's `curses` module.

## Requirements
- Python 3.8+
- A terminal that supports `curses` input and rendering

## How to Play
1. Run the game:
   ```bash
   python snake.py
   ```
2. Use the arrow keys to move the snake.
3. Collect `*` food to grow and earn points.
4. Avoid hitting walls or the snake's own body.
5. Press `q` to quit at any time.

## Notes
- The game window is 20 rows by 40 columns. Adjust `height` and `width` when constructing `SnakeGame` if you want a different size.
- If the snake fills the board, the game ends automatically.
