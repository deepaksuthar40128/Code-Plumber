#include <bits/stdc++.h>
#define all(x) (x).begin(), (x).end()
#define make_unique(x) \
sort(all((x)));    \
(x).resize(unique(all((x))) - (x).begin())
using namespace std;
void solve()
{
  int n,q;
  cin>>n>>q;
  int t;
  vector<long long>v;
  for(int i=0;i<n;i++)
  {
    cin>>t;
    v.push_back(t);
  }
  vector<long long>pref(n+1,0);
  for(int i=0;i<n;i++)
  {
    pref[i+1]=pref[i]+v[i];
  }
  vector<int>cnt(n+1,0);
  for(int i=0;i<n;i++)
  {
    bool f=0;
    if(v[i]==1)
    {
      f=1;
    }
    cnt[i+1]=cnt[i]+f;
  }
  // for(auto &it:cnt)
  {
    //   cout<<it<<' ';
    // 
  }
  // cout<<'\n';
  while(q--)
  {
    int a,b;
    cin>>a>>b;
    long long val = pref[b]-pref[a-1];
    int cl = ceil((b-a+1)*1.0/2);
    int len = cnt[b]-cnt[a-1];
    int r = 2*len+(b-a+1-len);
    if(b==a)
    {
      cout<<"NO"<<'\n';
    }
    else if(val>=r)
    {
      cout<<"YES"<<'\n';
    }
    else
    {
      cout<<"NO"<<'\n';
    }
  }


}
int main()
{
  ios_base::sync_with_stdio(false);
  cin.tie(nullptr);
  int tt;
  cin>>tt;
  while (tt--)
  {
    solve();
  }
  return 0;
}