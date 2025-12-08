"""Terminal-based Snake game using Python's curses module.

Run with:
    python snake.py

Controls:
    Arrow keys to move, 'q' to quit.
"""

import curses
import random
from collections import deque


class SnakeGame:
    """Encapsulates the game state and rendering for Snake."""

    def __init__(self, stdscr, height=20, width=40):
        self.stdscr = stdscr
        self.height = height
        self.width = width
        self.snake = deque()
        self.direction = curses.KEY_RIGHT
        self.score = 0
        self.food = None
        self._setup_window()
        self._init_snake()
        self._place_food()

    def _setup_window(self):
        curses.curs_set(0)
        self.stdscr.nodelay(True)
        self.stdscr.timeout(120)
        self.stdscr.keypad(True)

    def _init_snake(self):
        mid_y = self.height // 2
        mid_x = self.width // 2
        for offset in range(3):
            self.snake.appendleft((mid_y, mid_x - offset))

    def _place_food(self):
        available = {
            (y, x)
            for y in range(1, self.height - 1)
            for x in range(1, self.width - 1)
        } - set(self.snake)
        if not available:
            self.food = None
            return
        self.food = random.choice(list(available))

    def _render(self):
        self.stdscr.clear()
        # Draw borders
        for x in range(self.width):
            self.stdscr.addch(0, x, '#')
            self.stdscr.addch(self.height - 1, x, '#')
        for y in range(self.height):
            self.stdscr.addch(y, 0, '#')
            self.stdscr.addch(y, self.width - 1, '#')

        # Draw snake and food
        for y, x in self.snake:
            self.stdscr.addch(y, x, 'O')
        if self.food:
            fy, fx = self.food
            self.stdscr.addch(fy, fx, '*')

        self.stdscr.addstr(self.height, 0, f"Score: {self.score}")
        self.stdscr.refresh()

    def _next_head(self, direction):
        y, x = self.snake[0]
        if direction == curses.KEY_UP:
            return y - 1, x
        if direction == curses.KEY_DOWN:
            return y + 1, x
        if direction == curses.KEY_LEFT:
            return y, x - 1
        if direction == curses.KEY_RIGHT:
            return y, x + 1
        return y, x

    def _valid_direction(self, new_direction):
        opposites = {
            curses.KEY_UP: curses.KEY_DOWN,
            curses.KEY_DOWN: curses.KEY_UP,
            curses.KEY_LEFT: curses.KEY_RIGHT,
            curses.KEY_RIGHT: curses.KEY_LEFT,
        }
        return new_direction in opposites and opposites[new_direction] != self.direction

    def _handle_input(self):
        key = self.stdscr.getch()
        if key == ord('q'):
            return False
        if self._valid_direction(key):
            self.direction = key
        return True

    def _advance(self):
        new_head = self._next_head(self.direction)
        if self._is_collision(new_head):
            return False
        self.snake.appendleft(new_head)
        if self.food and new_head == self.food:
            self.score += 1
            self._place_food()
        else:
            self.snake.pop()
        return True

    def _is_collision(self, position):
        y, x = position
        hit_wall = y == 0 or y == self.height - 1 or x == 0 or x == self.width - 1
        hit_self = position in list(self.snake)
        return hit_wall or hit_self

    def loop(self):
        while True:
            self._render()
            if not self._handle_input():
                break
            if not self._advance():
                break
        self._render_game_over()
        self.stdscr.nodelay(False)
        self.stdscr.getch()

    def _render_game_over(self):
        message = f"Game Over! Final score: {self.score}. Press any key to exit."
        self.stdscr.addstr(self.height // 2, max(1, (self.width - len(message)) // 2), message)
        self.stdscr.refresh()


def main(stdscr):
    game = SnakeGame(stdscr)
    game.loop()


if __name__ == "__main__":
    curses.wrapper(main)
