const Templets = (lang:string):string=>{
    if(lang==='cpp'){
        return(
`${design}

#include<bits/stdc++.h>
using namespace std;
int main(){
  cout<<"Welcome to Code-Plumber\\nStart Editing it."<<endl;
  return 0;
} `)
   }
   else if(lang=='c'){
    return(
`${design}

#include<stdio.h> 
int main(){
  printf("Welcome to Code-Plumber\\nStart Editing it.\\n");
  return 0;
} `)
   }
    else if(lang=='java'){
    return(
`${design}

public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Code-Plumber\\nStart Editing it.");
    }
} `)
   }
   else if(lang=='python'){
    return(
`'''
${design}
'''
print("Welcome to Code-Plumber\\nStart Editing it.")
`)
   }
   return "Hello"
}

export default Templets;


const design = `/************************************************************************
*    ____          _            ____  _                 _               *
*  / ___|___   __| | ___      |  _ \\| |_   _ _ __ ___ | |__   ___ _ __  *
* | |   / _ \\ / _  |/ _ \\     | |_) | | | | | '_   _ \\| '_ \\ / _ \\ '__| *
* | |__| (_) | (_| |  __/    |   __/| | |_| | | | | | | |_) |  __/ |    *
* \\____\\___/ \\__,_|\\___|     |_|   |_|\\__,_|_| |_| |_|_.__/ \\___|_|     *
*                                                                       *
* Welcome to Code-Plumber - Where Code Flows Seamlessly!                *
*                                                                       *
* Dive into the world of coding with Code-Plumber,                      *
* your trusty online code editor and runner.                            *
*                                                                       *
* Happy coding!                                                         *
************************************************************************/`