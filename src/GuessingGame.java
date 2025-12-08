import java.util.Scanner;
import java.util.Random;

/**
 * 猜数字游戏
 * 适合Java初学者练习
 */
public class GuessingGame {

    public static void main(String[] args) {
        // 创建Scanner对象用于接收用户输入
        Scanner scanner = new Scanner(System.in);
        // 创建Random对象用于生成随机数
        Random random = new Random();

        // 游戏是否继续的标志
        boolean playAgain = true;

        // 游戏主循环
        while (playAgain) {
            // 生成1到100之间的随机数
            int secretNumber = random.nextInt(100) + 1;
            // 猜测次数
            int attempts = 0;
            // 是否猜中
            boolean hasGuessed = false;

            System.out.println("\n==== 欢迎来到猜数字游戏! ====");
            System.out.println("我已经想好了一个1到100之间的数字");
            System.out.println("请你来猜猜看是多少吧！");
            System.out.println("=============================\n");

            // 猜数字循环
            while (!hasGuessed) {
                System.out.print("请输入你猜的数字 (1-100): ");

                // 检查输入是否为有效的整数
                if (scanner.hasNextInt()) {
                    int guess = scanner.nextInt();
                    attempts++; // 猜测次数加1

                    // 判断猜测的数字
                    if (guess < 1 || guess > 100) {
                        System.out.println("请输入1到100之间的数字！");
                    } else if (guess < secretNumber) {
                        System.out.println("太小了！再试试更大的数字。");
                    } else if (guess > secretNumber) {
                        System.out.println("太大了！再试试更小的数字。");
                    } else {
                        // 猜中了
                        hasGuessed = true;
                        System.out.println("\n🎉 恭喜你！猜对了！");
                        System.out.println("答案就是: " + secretNumber);
                        System.out.println("你一共猜了 " + attempts + " 次");

                        // 根据猜测次数给出评价
                        if (attempts <= 5) {
                            System.out.println("太厉害了！你是猜数字高手！");
                        } else if (attempts <= 10) {
                            System.out.println("不错哦！");
                        } else {
                            System.out.println("继续加油！");
                        }
                    }
                } else {
                    // 输入不是数字
                    System.out.println("请输入有效的数字！");
                    scanner.next(); // 清除错误输入
                }
            }

            // 询问是否再玩一次
            System.out.print("\n要再玩一次吗？(y/n): ");
            String choice = scanner.next().toLowerCase();

            if (!choice.equals("y") && !choice.equals("yes")) {
                playAgain = false;
                System.out.println("\n感谢游玩！再见！👋");
            }
        }

        // 关闭Scanner
        scanner.close();
    }
}
