#include <bits/stdc++.h>
#define int long long
using namespace std;

inline int nxt()
{
    int x;
    cin >> x;
    return x;
}

int solve()
{
    int n = nxt();
    int m = nxt();
    cin >> n >> m;
    cout << "? 1 1" << endl;
    int a = nxt();
    a += 2;
    cout << "? " << n << " 1" << endl;
    int b;
    cin >> b;
    b -= (n - 1);
    b = -b;
    int x = (a + b) / 2;
    int y = a - x;
    if (x >= 1 && x <= n && y >= 1 && y <= m)
    {
        cout << "? " << x << " " << y << endl;
        int out;
        cin >> out;
        if (out == 0)
        {
            cout << "! " << x << " " << y;
        }
        else
        {
            cout << "? " << n << " " << m << endl;
            int c;
            cin >> c;
            c -= (n + m);
            c = -c;
            a = c;
            x = (a + b) / 2;
            y = a - x;
            cout << "! " << x << " " << y;
        }
    }
    else
    {
        cout << "? " << n << " " << m << endl;
        int c;
        cin >> c;
        c -= (n + m);
        c = -c;
        a = c;
        x = (a + b) / 2;
        y = a - x;
        cout << "! " << x << " " << y;
    }
}
signed main()
{
    int t;
    cin >> t;
    while (t--)
    {
        solve();
        cout << endl;
    }
    return 0;
}
