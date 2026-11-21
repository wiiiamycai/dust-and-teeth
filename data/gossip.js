"use strict";
// ================= DATA: GOSSIP & REACTIONS =================
// how each kind of news changes opinions
const EV={
  murder:{family:-80,friend:-40,enemy:20,other:-10,witness:-30,crime:1,spec:{krug:5,lou:5,junior:5,king:10}},
  slain:{family:-60,friend:-25,enemy:15,other:0},
  sold:{self:-80,family:-80,friend:-40,enemy:15,other:-10,crime:1,spec:{krug:15,opal:-40,sheriff:-30,teo:-20}},
  stew:{family:-90,friend:-50,other:-20,crime:1,spec:{lou:20,junior:20}},
  rescued:{self:60,family:50,friend:30,other:8,spec:{lou:-50,junior:-50,krug:-40}},
  freed:{other:10,spec:{krug:-100,teo:70,opal:50,sheriff:30,king:-20}},
  married:{self:30,family:20},helped:{self:30,family:15,friend:10,other:3},stole:{self:-35,family:-10,friend:-10},
  cannibal:{other:-10,spec:{lou:25,junior:25}},slaver:{other:-10,spec:{krug:30,opal:-60,sheriff:-50,teo:-30,moe:-20}},
  pump:{other:15,spec:{mayor:-30,sheriff:30,moe:20}},hanged:{other:12,spec:{sheriff:40,moe:15}},
  tfixed:{other:4,spec:{crumb:60,elder:20,gus:20,pell:20}},tstolen:{spec:{crumb:-60,elder:-20,gus:-15,pell:-15}},
  nuked:{other:-100,spec:{king:60}},raidkill:{}
};
const LAW={sheriff:'rustwater',gus:'scrapwell'};
const RXG={
  murder:{family:(v,f)=>`"You killed my ${f}. I'll see you in the ground."`,friend:v=>`"${v} was my friend. Stay away from me."`,enemy:v=>`"Heard you did ${v}. Can't say I'm crying."`,other:v=>`"Heard what you did to ${v}."`},
  slain:{family:(v,f)=>`"My ${f} is dead because of you."`,friend:v=>`"You killed ${v}. Don't care who started it."`,enemy:v=>`"${v}'s dead? Drinks on me."`},
  sold:{self:()=>`"You sold me. I'll remember."`,family:(v,f)=>`"You SOLD my ${f}? To SLAVERS?"`,friend:v=>`"You sold ${v} to Krug. Animal."`,enemy:v=>`"${v} in chains. Good."`,other:()=>`"Word is you sell people now."`},
  stew:{family:(v,f)=>`"My ${f} went in Lou's pot. Because of you."`,friend:v=>`"${v} was the soup of the day. Your doing."`,other:v=>`"They say you sold ${v} for stew."`},
  rescued:{self:()=>`"You got me out. I won't forget."`,family:(v,f)=>`"You brought my ${f} back. I owe you."`,friend:v=>`"You got ${v} out. Thank you."`},
  freed:{other:()=>`"Heard you emptied Chainfield. Brave or stupid."`},
  stole:{self:()=>`"Something of mine went missing. I'm watching you."`},
  cannibal:{other:()=>`"They say you eat people. Keep your distance."`},
  slaver:{other:()=>`"Nice tattoo, slaver."`},
  pump:{other:()=>`"Free water! Heard that was you."`},
  hanged:{other:()=>`"Saw the Mayor swing. Heard you gave her the ledger."`},
  tfixed:{other:()=>`"The Toaster spoke! Because of you!"`},
  married:{family:()=>`"Welcome to the family. Don't make me regret it."`},
  nuked:{other:()=>`"You... you did that? All those people?"`}
};
const RXS={'tstolen::crumb':`"The Toaster is gone. The crumbs told me it was you."`,'freed::krug':`"You took my stock. I'll take your head."`,'freed::opal':`"You emptied Chainfield. Drinks are on the house. Forever."`,
  'freed::teo':`"Free. Still broke. But free."`,'slaver::opal':`"Get out. Slavers took my sister."`,'cannibal::lou':`"Welcome to the family, sweetie."`,'nuked::king':`"Beautiful. Like a fresh extraction."`};

