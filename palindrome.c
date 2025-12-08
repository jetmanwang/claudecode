#include<stdio.h>

int main()
{
    int i,num=0,bai,shi,ge;
    /******Program******/
    for(i=100; i<=999; i++)
    {
        bai = i / 100;      // 获取百位数字
        shi = (i / 10) % 10; // 获取十位数字
        ge = i % 10;         // 获取个位数字

        if(bai == ge)        // 判断是否为回文数
        {
            num++;           // 计数器加1
        }
    }
    /******  End  ******/
    printf("num=%d",num);
    return 0;
}
