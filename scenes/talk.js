'use strict';
// ================= TALK =================
SC.talk = id => {
  if (!alive(id)) return goHere();
  const n = S.n[id],
    d = NPC[id];
  while (n.rx.length) quote(`${d.n}: ${n.rx.shift()}`);
  if (hostile(id)) {
    bad(`${d.n} attacks!`);
    return fight(crew(id), { win: 'back', back: ['map'] });
  }
  const refuses = n.op <= -35 && !['hector', 'bess', 'bert', 'pete', 'moe'].includes(id); // Moe lies to people he hates instead
  if (!d.animal && !refuses) chatted(id); // before any labels, so a newly earned Read People shows at once
  const back = ['Back', () => goHere()];
  const atk = NPC[id].animal
    ? null
    : [`Attack ${d.n}`, () => fight(crew(id), { started: true, win: 'back', back: ['map'] }), 'danger'];
  const qk = id === 'king' ? null : [`Murder ${d.n} quietly` + hint('murder', id), () => quiet(id), 'danger'];
  if (refuses) {
    show({
      title: d.n,
      icon: d.i,
      sub: `Lv ${n.lvl} · ${mood(n.op)}`,
      text: `${d.n} won't talk to you.`,
      opts: [atk, qk, back],
    });
    return;
  }
  const r = TALK[id]();
  if (!r) return;
  show({ title: d.n, icon: d.i, sub: `Lv ${n.lvl} · ${mood(n.op)}`, text: r.t, opts: [...r.o, atk, qk, back] });
};
const re = id => () => go('talk', id);
const newsOpt = (id, dflt) => [
  '"Any news?"',
  () => {
    quote(`${NPC[id].n}: ${news(id, dflt)}`);
    go('talk', id);
  },
];
function sellSpouse(to) {
  const x = S.spouse,
    nm = NPC[x].n;
  S.spouse = null;
  S.f.spouseWho = x;
  S.f.soldSomeone = 1;
  if (to === 'krug') {
    S.n[x].loc = 'pen';
    S.n[x].st.penDay = S.day;
    S.f.spouseFate = 'slave';
    karma(-5);
    addTitle('Sold Their Spouse to Slavers');
    event('sold', x, { loc: 'chainfield' });
    quote(
      x === 'bert'
        ? `Krug checks Bert's teeth. "Good stock." Bert: "At least it's a good price. Thank you for that."`
        : `Krug inspects Bess. Bess inspects Krug. "Still more exciting than the farm," she says. Her eyes say something else.`,
    );
    gain(perk('butcher') ? 600 : 300);
    go('talk', 'krug');
  } else {
    S.dead[x] = 1;
    S.f.spouseFate = 'stew';
    karma(-6);
    addTitle('Sold Their Spouse for Stew');
    event('stew', x, { loc: 'diner' });
    quote(`Lou has a "special room for couples". One short scream. "Come back Thursday. ${nm} is the special."`);
    gain(perk('butcher') ? 400 : 200);
    go('talk', 'lou');
  }
}
function tattoo() {
  S.f.slaver = 1;
  karma(-4);
  addTitle('Slaver');
  event('slaver', null, { loc: 'chainfield' });
  say('Krug inks a chain on your neck. "Welcome to the family." +50 teeth.');
  gain(50);
  go('talk', 'krug');
}
function stopKing(how) {
  if (S.f.kingStopped) return;
  S.f.kingStopped = 1;
  S.f.kingHow = how;
  gainXP(300);
}
function flirt(key) {
  if (attempt(key)) {
    quote('Bess: "Behind the barn. Ten minutes."');
    say("It's the most interesting thing to happen on this farm in eleven years. Then: the click of a shotgun.");
    go('wedding', 'bess');
  } else go('talk', 'bess');
}
function penTalk(x) {
  return {
    t:
      x === 'bess'
        ? knows('bess', 'sold', 'bess')
          ? '"Oh. It\'s you." Bess, in chains, does not look surprised.'
          : 'Bess, in chains.'
        : '"Hi," says Bert, in chains. "Krug says I have good teeth."',
    o: [
      [
        alive('krug') ? `Pick ${x === 'bess' ? 'her' : 'his'} lock tonight` + hint('pen.lock', x) : 'Open the pen',
        () => {
          if (!alive('krug') || attempt('pen.lock', x)) go('freed1', x);
          else {
            bad('A slaver spots you.');
            if (alive('krug')) S.n.krug.op -= 30;
            fight([slv(), slv()], { started: true, win: 'go', args: ['freed1', x], back: ['map'] });
          }
        },
      ],
    ],
  };
}
SC.freed1 = x => {
  const nm = NPC[x].n;
  S.n[x].loc = 'free';
  show({
    title: nm,
    icon: NPC[x].i,
    text:
      x === 'bess'
        ? '"You sold me. Then you came back." She rubs her wrists. "I don\'t know what we are."'
        : 'Bert rubs his wrists. "Thank you. I think. It\'s complicated."',
    opts: [
      [
        '"Go home to your father."',
        () => {
          S.n[x].loc = 'farm';
          event('rescued', x);
          if (x === 'bess') S.f.bessHome = 1;
          gainXP(100);
          goHere();
        },
      ],
      S.f.spouseWho === x && canTry('spouse.back', x)
        ? [
            '"Come back to me."' + hint('spouse.back', x),
            () => {
              if (attempt('spouse.back', x)) {
                S.spouse = x;
                S.n[x].loc = 'party';
                S.f.spouseFate = null;
                S.f.reunited = 1;
                event('rescued', x);
                quote(`${nm}: "Fine. But I hold the knife from now on."`);
              } else {
                S.n[x].loc = 'farm';
                event('rescued', x);
                if (x === 'bess') S.f.bessHome = 1;
                bad(`${nm} laughs at you and walks home.`);
              }
              goHere();
            },
          ]
        : null,
    ],
  });
};
function stew() {
  if (!pay(5)) return goHere();
  const f = S.f;
  f.stew = (f.stew || 0) + 1;
  if (f.louReformed || f.cannibal || f.stew === 1) {
    say(`${f.louReformed ? 'Mole-dog. Mostly.' : "Rich, gamey, a texture you can't place."} +${heal(12)} HP.`);
    goHere();
  } else {
    know('lou.polish');
    go('stewreveal');
  }
}
SC.stewreveal = () =>
  show({
    title: "Mama Lou's",
    icon: '🍲',
    text: 'Your spoon hits something. A fingernail. Painted. The label on the polish says "Sal\'s Sunday Best". Lou is watching you. Smiling.',
    opts: [
      [
        'Keep eating',
        () => {
          S.f.cannibal = 1;
          karma(-2);
          addTitle('Cannibal');
          event('cannibal', null, { loc: 'diner' });
          say(`Lou beams like a proud mother. Corpses look like lunch now. +${heal(20)} HP.`);
          goHere();
        },
      ],
      [
        'Spit it out',
        () => {
          quote('Lou: "Bone in it? Happens. Very fresh, see."');
          goHere();
        },
      ],
      dumb()
        ? [
            'Eat the fingernail too',
            () => {
              S.f.cannibal = 1;
              karma(-2);
              addTitle('Cannibal');
              event('cannibal', null, { loc: 'diner' });
              say('Crunchy. Junior is impressed, and Junior has seen things.');
              goHere();
            },
          ]
        : null,
    ],
  });
SC.kitchen = () => {
  const p = S.n.pete,
    o = [];
  let t;
  if (!alive('pete') || p.loc !== 'cage') t = 'Hooks, knives, a pot you could bathe in. The pantry cage is empty.';
  else {
    t =
      'Hooks on the ceiling, some occupied. Two guard badges on a shelf. In a shopping-trolley cage: a guard with a label. PETE. TENDERISE TUESDAY. "Please," he whispers. "Sal was Monday."';
    if (!S.f.badge)
      o.push([
        'Take the badges',
        () => {
          S.f.badge = 1;
          give('badge');
          say("One says SAL. It's been gnawed.");
          go('kitchen');
        },
      ]);
    o.push([
      'Pick the cage lock' + hint('kitchen.cage'),
      () => {
        if (attempt('kitchen.cage')) {
          p.loc = 'rustwater';
          karma(2);
          gainXP(100);
          event('rescued', 'pete', { loc: 'diner', wit: [] });
          say('You and Pete crawl out past the bins. He runs for Rustwater faster than anyone has ever run.');
          go('hub', 'diner');
        } else {
          bad('The lock snaps. Junior is in the doorway. "Not Tuesday yet."');
          fight([...(alive('junior') ? [foe('junior')] : []), ...(alive('lou') ? [foe('lou')] : [])], {
            started: true,
            win: 'kitchenwin',
            back: ['map'],
          });
        }
      },
    ]);
    o.push([
      'Leave him',
      () => {
        karma(-2);
        say('He stops saying please after a while.');
        go('hub', 'diner');
      },
    ]);
    o.push([
      'Kill Pete yourself. Kinder than Tuesday.',
      () => {
        kill('pete', 'secret');
        S.n.lou.op += 10;
        quote('Lou: "I had a menu planned!" Then, softer: "You\'ve got a feel for it, honey."');
        go('hub', 'diner');
      },
      'danger',
    ]);
  }
  o.push(['Back to the dining room', () => go('hub', 'diner')]);
  show({ title: 'The kitchen', icon: '🔪', text: t, opts: o });
};
WIN.kitchenwin = () => {
  if (alive('pete') && S.n.pete.loc === 'cage') {
    S.n.pete.loc = 'rustwater';
    karma(2);
    gainXP(100);
    event('rescued', 'pete', { loc: 'diner', wit: [] });
    say('You let Pete out of his cage. He steps over the cooks and runs for Rustwater.');
  }
  go('hub', 'diner');
};
SC.wedding = x => {
  const nm = NPC[x].n;
  if (!alive('hector')) {
    S.spouse = x;
    S.n[x].loc = 'party';
    S.f.spouseWho = x;
    addTitle('Married');
    event('married', x, { loc: 'farm' });
    say(`No Hector, no wedding. ${nm} insists anyway. The scarecrow officiates.`);
    return go('hub', 'farm');
  }
  show({
    title: 'Shotgun wedding',
    icon: '💒',
    text: `Hector. Shotgun. "Looks like we're having a wedding."`,
    opts: [
      [
        '"I do."',
        () => {
          S.spouse = x;
          S.n[x].loc = 'party';
          S.f.spouseWho = x;
          addTitle('Married');
          event('married', x, { loc: 'farm' });
          say(
            `Hector reads the vows from a tractor magazine. ${nm} cries. Hector cries. Dowry: 20 teeth and a promise not to shoot you. For now.`,
          );
          gain(20);
          go('hub', 'farm');
        },
      ],
      canTry('wedding.out') && [
        '"I can\'t. I\'m already married. To a toaster."' + hint('wedding.out'),
        () => {
          if (attempt('wedding.out')) {
            S.f.spouseFate = 'refused';
            say('Hector is too confused to shoot. "Get off my farm."');
            go('map');
          } else {
            bad('"Nice speech. Wedding\'s still on."');
            event('lied', 'hector', { wit: [] });
            go('wedding', x);
          }
        },
      ],
      ['Fight Hector', () => fight([foe('hector')], { started: true, win: 'back', back: ['map'] }), 'danger'],
      [
        'Run',
        () => {
          if (roll(fleeP())) {
            S.f.spouseFate = 'refused';
            S.n.hector.op -= 40;
            say('You run. Buckshot sings past your ears.');
            go('map');
          } else {
            bad('Buckshot in the backside. -8 HP.');
            if (hurt(8, 'Shot at your own shotgun wedding.')) return;
            go('wedding', x);
          }
        },
      ],
    ],
  });
};

const TALK = {
  elder: () => {
    const o = [],
      f = S.f;
    if (goodHeard('elder') >= 2 && !f.elderGift2)
      o.push([
        '"You look pleased with me."',
        () => {
          f.elderGift2 = 1;
          const had = S.weapons.includes('knife');
          if (had) give('gutglue', 2);
          else S.weapons.push('knife');
          quote(
            had
              ? "Ma Thistle: \"Word gets around. You're turning out decent. Here. Glue. Don't ask what's in it.\" (+2 Gut Glue)"
              : 'Ma Thistle: "Word gets around. You\'re turning out decent. Take this knife. My second husband\'s. He used it on my first."',
          );
          go('talk', 'elder');
        },
      ]);
    if (!f.elderGift)
      o.push([
        D('"I\'m going past the fence."', '"Me go past fence."'),
        () => {
          f.elderGift = 1;
          give('gutglue', 2);
          quote('Ma Thistle: "Good. Don\'t die near the well." (+2 Gut Glue)');
          go('talk', 'elder');
        },
      ]);
    o.push(newsOpt('elder', '"Nothing happens here. That\'s the point of here."'));
    if (S.day >= 8 && !f.knowSilo)
      o.push([
        '"You look worried."',
        () => {
          quote('Ma Thistle: "Bad dreams. A tooth in the ground, east past the plane. A king with no smile."');
          learnSilo();
          go('talk', 'elder');
        },
      ]);
    if (f.nigel && !f.elderTold)
      o.push([
        '"I found out what\'s in the well."',
        () => {
          f.elderTold = 1;
          quote(
            'Ma Thistle: ' +
              {
                dead: '"Good. Never trusted anything that glows."',
                hat: '"You gave it a HAT? None of my husbands were that thoughtful."',
                dentist: '"A dentist? Does he do dentures?"',
                moved: '"Moved to a plane. Everyone needs a hobby."',
                lied: '"Dead, you say. You\'re a terrible liar. I like that."',
              }[f.nigel],
          );
          go('talk', 'elder');
        },
      ]);
    return {
      t: D('94 years old. Smokes goat leather. "Spit it out."', 'Old lady. Smokes a goat. "Oh no. It\'s you."'),
      o,
    };
  },
  gus: () => {
    const o = [],
      f = S.f;
    let t = 'Gus. Mostly forearms. Has found water once.';
    if (!f.wellQ) {
      t += ' "Something\'s eating the chickens we lower down the well. Sort it. 40 teeth."';
      o.push([
        '"I\'ll look into it."',
        () => {
          f.wellQ = 1;
          go('talk', 'gus');
        },
      ]);
    } else if (f.nigel && !f.gusPaid) {
      if (f.nigel === 'hat') {
        o.push([
          "Tell the truth: it's a glowing dentist",
          () => {
            f.nigel = 'dentist';
            f.gusPaid = 1;
            quote('Gus: "A dentist? My back tooth\'s been killing me." He comes back up grinning, one tooth lighter.');
            gain(40);
            gainXP(75);
            event('helped', 'gus');
            go('talk', 'gus');
          },
        ]);
        o.push([
          '"It\'s dead. I killed it."' + hint('gus.lie'),
          () => {
            if (attempt('gus.lie')) {
              f.nigel = 'lied';
              f.gusPaid = 1;
              quote('Gus: "Good riddance."');
              gain(40);
              gainXP(50);
              karma(-1);
            } else {
              bad('Gus: "Then why can I hear it humming?" No pay.');
              event('lied', 'gus', { wit: [] });
              f.gusPaid = 1;
              f.nigel = 'dentist';
            }
            go('talk', 'gus');
          },
        ]);
      } else
        o.push([
          '"It\'s dealt with."',
          () => {
            f.gusPaid = 1;
            quote('Gus: "Huh. Good." He pays you.');
            gain(40);
            gainXP(75);
            event('helped', 'gus');
            go('talk', 'gus');
          },
        ]);
    } else t += f.gusPaid ? ' "Chickens sleep better now."' : ' "Well? The chickens are nervous."';
    o.push(newsOpt('gus', '"Dug a hole. Found dirt."'));
    return { t, o };
  },
  crumb: () => {
    const o = [],
      f = S.f;
    const t = f.tfixed
      ? 'Brother Crumb bows low. "Prophet."'
      : f.tstolen
        ? "Crumb prays to an empty altar. A test of faith, he says. He's failing it."
        : 'Crumb prays to a chrome toaster. "When it speaks, the Bread Times come." It hasn\'t popped in 200 years.';
    if (!f.tfixed && !f.tstolen) {
      if (has('coil'))
        o.push([
          'Fix the Toaster with your coil' + (S.stats.brains >= 8 ? '' : hint('toaster.fix')),
          () => {
            if (S.stats.brains >= 8 || attempt('toaster.fix')) {
              take('coil');
              f.tfixed = 1;
              karma(2);
              addTitle('Prophet of the Toaster');
              event('tfixed', null);
              give('gutglue', 2);
              gain(20);
              gainXP(150);
              quote('POP. Toast hits Crumb in the face. "THE BREAD TIMES!" (+2 Gut Glue)');
            } else {
              bad('The Toaster bites. -6 HP.');
              if (hurt(6, 'Electrocuted by a holy appliance.')) return;
            }
            go('talk', 'crumb');
          },
        ]);
      o.push(
        canTry('toaster.steal') && [
          'Steal the Toaster' + hint('toaster.steal'),
          () => {
            if (attempt('toaster.steal')) {
              f.tstolen = 1;
              give('toaster');
              karma(-2);
              event('tstolen', null, { wit: [] });
              say("You swap it for a rock. He won't notice for hours.");
            } else {
              bad('He catches you. He just looks at you. Worse than a fight.');
              S.n.crumb.op -= 20;
            }
            go('talk', 'crumb');
          },
        ],
      );
    }
    if (S.spouse)
      o.push([
        `Annul your marriage (${cost(100, 'crumb')} teeth)`,
        () => {
          if (pay(cost(100, 'crumb'))) {
            const x = S.spouse;
            S.n[x].loc = 'farm';
            S.f.spouseFate = 'annulled';
            S.spouse = null;
            S.n[x].op -= 20;
            say(`Your union is declared "unbuttered". ${NPC[x].n} walks home.`);
          }
          go('talk', 'crumb');
        },
      ]);
    o.push([
      'Confess your sins',
      () => {
        quote(
          S.titles.length
            ? `Crumb hears it all: ${S.titles.join(', ')}. "The Toaster forgives you. I don't."`
            : 'Crumb: "That\'s barely a sin. Try harder."',
        );
        go('talk', 'crumb');
      },
    ]);
    return { t, o };
  },
  pell: () => ({
    t: alive('pig')
      ? '"Bacon Prime is the last purebred pig in the wastes. I\'ve seen his papers. He ate them."'
      : "Pell holds a little pig hat. He doesn't look up.",
    o: [
      alive('pig')
        ? [
            '"Sell me the pig."',
            () => {
              quote('Pell: "Over my dead body." You hear a price.');
              go('talk', 'pell');
            },
          ]
        : null,
      newsOpt('pell', '"Pig\'s fine. That\'s all the news I need."'),
    ],
  }),
  pig: () => ({
    t: 'Bacon Prime regards you like a minor aristocrat.',
    o: [
      [
        'Pet him',
        () => {
          if (roll(50)) say('He allows it. You feel chosen.');
          else {
            bad('He bites. -2 HP.');
            if (hurt(2, 'Bitten to death by a pig.')) return;
          }
          go('talk', 'pig');
        },
      ],
      [
        alive('pell') ? 'Steal him' + hint('pig.steal') : 'Take him',
        () => {
          if (!alive('pell') || attempt('pig.steal')) {
            S.dead.pig = 1;
            S.f.pigStolen = 1;
            give('pig');
            karma(-1);
            if (alive('pell')) event('stole', 'pell', { wit: [] });
            say('Into the sack. Heavy. Furious.');
            goHere();
          } else {
            bad('Pell sees you. Pitchfork.');
            fight([foe('pell')], { win: 'back', back: ['map'] });
          }
        },
      ],
    ],
  }),
  nigel: () => {
    const o = [],
      f = S.f;
    if (f.nigel)
      return {
        t:
          {
            hat: 'Nigel waves. His hat glows faintly. "Still not eating chickens. Mostly."',
            dentist: 'A sign: NIGEL, DENTIST. GLOWS BUT GENTLE.',
            lied: 'Nigel is eating a chicken. "You didn\'t see this."',
            moved: 'Nigel is doing the dead passengers\' teeth. "Great listeners."',
          }[f.nigel] || 'Nigel glows.',
        o,
      };
    o.push([
      '"What ARE you?"',
      () => {
        f.nLore = 1;
        know('nigel.lore');
        quote(
          'Nigel: "Ex-dentist. Glowing rock. Long story. My scalp glows so bright I can\'t sleep. A hat would change my life."',
        );
        go('talk', 'nigel');
      },
    ]);
    if (f.nLore && (has('hat') || has('tophat')))
      o.push([
        'Give him a hat',
        () => {
          has('hat') ? take('hat') : take('tophat');
          f.nigel = 'hat';
          karma(2);
          event('helped', 'nigel');
          quote('Nigel weeps. "I can\'t see my own head." He hands you his dental savings.');
          gain(60);
          gainXP(75);
          go('talk', 'nigel');
        },
      ]);
    o.push(
      canTry('nigel.move') && [
        '"There\'s a crashed plane east. Quiet neighbours. All dead."' + hint('nigel.move'),
        () => {
          if (attempt('nigel.move')) {
            f.nigel = 'moved';
            S.n.nigel.loc = 'skybus';
            karma(1);
            gainXP(75);
            say('You sell him on the crashed plane. Quiet neighbours. He packs his chicken and goes.');
            goHere();
          } else {
            bad('"You just want me gone." He hugs his chicken.');
            go('talk', 'nigel');
          }
        },
      ],
    );
    if (dumb())
      o.push([
        '"You glow. Glow bad?"',
        () => {
          quote('Nigel: "Glow bad." You nod together. Best chat either of you has had in years.');
          go('talk', 'nigel');
        },
      ]);
    return {
      t: f.nLore
        ? 'Nigel glows gently among the feathers.'
        : 'A green, glowing man holding half a chicken. "Please don\'t scream. Everyone screams."',
      o,
    };
  },
  moe: () => {
    const o = [];
    o.push([
      `Warm beer (${cost(3, 'moe')})`,
      () => {
        if (pay(cost(3, 'moe'))) {
          give('beer');
          say('Warm. Flat. Beer.');
        }
        go('talk', 'moe');
      },
    ]);
    if (!S.armors.includes('jacket'))
      o.push([
        `Leather jacket, armour 2 (${cost(60, 'moe')})`,
        () => {
          if (pay(cost(60, 'moe'))) {
            S.armors.push('jacket');
            if (A[S.armor].dr < 2) S.armor = 'jacket';
            say('Leather jacket. Smells like the last guy. (Equipped)');
          }
          go('talk', 'moe');
        },
      ]);
    if (!S.f.hatBought)
      o.push([
        `A hat (${cost(15, 'moe')})`,
        () => {
          if (pay(cost(15, 'moe'))) {
            S.f.hatBought = 1;
            give('hat');
            say('"It\'s mostly hat."');
          }
          go('talk', 'moe');
        },
      ]);
    o.push([
      '"What\'s the word?"',
      () => {
        quote('Moe: ' + moeWord());
        go('talk', 'moe');
      },
    ]);
    return {
      t: D(
        "Moe wipes the same dirty glass he's wiped for thirty years.",
        'Man. Glass. Dirty. You point. Moe nods. Friends.',
      ),
      o,
    };
  },
  mayor: () => {
    const o = [],
      f = S.f;
    o.push([
      '"Why does water cost teeth here?"',
      () => {
        f.mWell = 1;
        quote('Fenwick: "There was a free well. Filled up with corpses. Tragic. Nobody knows how." He winks.');
        go('talk', 'mayor');
      },
    ]);
    if (f.mWell && !f.pumpOpen)
      o.push(
        canTry('mayor.pump') && [
          '"Open the pump, before the town opens you."' + hint('mayor.pump'),
          () => {
            if (attempt('mayor.pump')) {
              f.pumpOpen = 1;
              karma(4);
              addTitle('Bringer of Water');
              event('pump', null);
              gainXP(150);
              quote('You describe angry mobs. In detail. With diagrams. He opens the pump, hating every second.');
            } else bad('Fenwick: "Free water? Next you\'ll want free funerals."');
            go('talk', 'mayor');
          },
        ],
      );
    if (!f.mayorJob && alive('sheriff'))
      o.push([
        '"Any work?"',
        () => {
          f.mayorJob = 1;
          f.mayorJobDay = S.day;
          quote('Fenwick: "The Sheriff asks too many questions. 150 teeth if she has a gardening accident. Soon."');
          go('talk', 'mayor');
        },
      ]);
    if (f.mayorJob && !alive('sheriff') && !f.mayorPaid && !f.hitDone)
      o.push([
        '"The Sheriff is dead. Pay up."',
        () => {
          f.mayorPaid = 1;
          karma(-1);
          addTitle("Mayor's Butcher");
          gain(150);
          gainXP(100);
          quote('Fenwick: "Gardening. Dreadful business."');
          go('talk', 'mayor');
        },
      ]);
    if (has('ledger') && !f.blackmail)
      o.push([
        'Blackmail him with his ledger',
        () => {
          f.blackmail = 1;
          karma(-1);
          addTitle('Blackmailer');
          gain(150);
          gainXP(75);
          S.n.mayor.op -= 40;
          quote('He sweats through his hat. 150 teeth.');
          go('talk', 'mayor');
        },
      ]);
    if (!f.ledgerTaken)
      o.push([
        'Steal the ledger from his fridge desk' + hint('mayor.ledger'),
        () => {
          if (attempt('mayor.ledger')) {
            f.ledgerTaken = 1;
            give('ledger');
            say('Got it. Every corpse in the free well. Dates. Prices. Neat handwriting.');
            go('talk', 'mayor');
          } else {
            bad('"GUARDS!"');
            S.n.mayor.op = -100;
            fight([dep(), dep()], { win: 'back', back: ['map'] });
          }
        },
      ]);
    if (!has('tophat') && !f.hatTaken)
      o.push(
        canTry('mayor.hat') && [
          'Lift his top hat' + hint('mayor.hat'),
          () => {
            if (attempt('mayor.hat')) {
              f.hatTaken = 1;
              give('tophat');
              say('He blames a bird.');
            } else bad('"Hands where I can see them."');
            go('talk', 'mayor');
          },
        ],
      );
    if (S.stats.brains >= 8 && f.mayorTribute && !f.tributeSpotted)
      o.push([
        '"Funny how the Molars skipped your office."',
        () => {
          f.tributeSpotted = 1;
          S.n.mayor.op -= 20;
          gain(60);
          quote('Fenwick goes white and slides 60 teeth across the fridge. "Let\'s keep that between friends."');
          go('talk', 'mayor');
        },
      ]);
    return {
      t: f.pumpOpen
        ? 'Fenwick sulks behind his fridge desk.'
        : 'Soft man, hard top hat, desk made from a fridge. "Thirsty, citizen?"',
      o,
    };
  },
  sheriff: () => {
    const o = [],
      f = S.f;
    o.push([
      '"What do you make of the Mayor?"',
      () => {
        quote('Crane: "He poisoned the free well to sell us water. Get me his ledger. Then he swings."');
        go('talk', 'sheriff');
      },
    ]);
    if (has('ledger'))
      o.push([
        'Hand over the ledger',
        () => {
          take('ledger');
          f.ledgerGiven = 1;
          if (alive('mayor')) {
            f.hanged = 1;
            S.dead.mayor = 1;
            karma(4);
            addTitle('Hero of Rustwater');
            event('hanged', 'mayor');
            quote('By sundown Fenwick hangs from his own pump. The water runs free.');
          } else quote('Crane: "Already dead? Saves rope."');
          gain(100);
          gainXP(150);
          go('talk', 'sheriff');
        },
      ]);
    if (!f.krugBounty)
      o.push([
        '"Any bounties?"',
        () => {
          f.krugBounty = 1;
          quote('Crane: "Krug, the slaver. 100 teeth if he turns up dead."');
          go('talk', 'sheriff');
        },
      ]);
    if (f.krugBounty && !alive('krug') && !f.krugPaid1)
      o.push([
        'Claim the Krug bounty',
        () => {
          f.krugPaid1 = 1;
          gain(100);
          gainXP(100);
          go('talk', 'sheriff');
        },
      ]);
    if (f.knowRaid && !f.warned && !f.raid)
      o.push([
        'Warn her: the Molars are coming',
        () => {
          f.warned = 1;
          S.n.sheriff.op += 15;
          gainXP(50);
          quote('Crane: "Then we\'ll be ready." She starts handing out rifles.');
          go('talk', 'sheriff');
        },
      ]);
    if (f.knowSilo && !f.kingStopped && !f.sheriffAlly)
      o.push([
        '"Ride with me to Silo 9."',
        () => {
          if (S.n.sheriff.op >= 40) {
            f.sheriffAlly = 1;
            quote('Crane checks her rifle. "About time someone did." She\'ll join you at the silo.');
          } else quote('Crane: "I don\'t trust you that much."');
          go('talk', 'sheriff');
        },
      ]);
    if (S.n.sheriff.op >= 60 && !S.armors.includes('vest'))
      o.push([
        '"Got any spare armour?"',
        () => {
          S.armors.push('vest');
          quote('Crane tosses you her old vest. "It\'s sentimental. Don\'t get shot in it."');
          go('talk', 'sheriff');
        },
      ]);
    o.push(newsOpt('sheriff', '"Quiet. I hate quiet."'));
    return { t: 'Sheriff Crane. Has shot a lot of people. Regrets maybe two.', o };
  },
  doc: () => {
    const o = [],
      c = b => cost(b, 'doc');
    o.push([
      `Heal fully (${c(30)})`,
      () => {
        if (pay(c(30))) {
          heal(S.maxhp);
          say('Fishing line and enthusiasm. Good as new.');
        }
        go('talk', 'doc');
      },
    ]);
    o.push([
      `Gut Glue (${c(25)})`,
      () => {
        if (pay(c(25))) give('gutglue');
        go('talk', 'doc');
      },
    ]);
    if (heard('doc', 'cannibal') || S.n.doc.op <= -25)
      o.push([
        '"And some Buzz."',
        () => {
          quote(
            heard('doc', 'cannibal')
              ? 'Doc: "Not to you. I\'ve heard what you put in your mouth. Buzz makes people hungry."'
              : 'Doc: "Buzz is for customers I like."',
          );
          go('talk', 'doc');
        },
      ]);
    else
      o.push([
        `Buzz (${c(20)})`,
        () => {
          if (pay(c(20))) give('buzz');
          go('talk', 'doc');
        },
      ]);
    if (S.addicted)
      o.push([
        `Cure your Buzz habit (${c(50)})`,
        () => {
          if (pay(c(50))) {
            S.addicted = false;
            say('A day strapped to a chair while he yells at you. Clean.');
          }
          go('talk', 'doc');
        },
      ]);
    if (S.f.rash)
      o.push([
        `Cure the rash (${c(40)})`,
        () => {
          if (pay(c(40))) {
            S.f.rash = 0;
            S.maxhp += 5;
            say('A cream made of dead lizard. It works.');
          }
          go('talk', 'doc');
        },
      ]);
    if (!S.f.coilGot && !has('coil'))
      o.push([
        `Heating coil (${c(60)})`,
        () => {
          if (pay(c(60))) {
            give('coil');
            S.f.coilGot = 1;
          }
          go('talk', 'doc');
        },
      ]);
    if (has('toaster'))
      o.push([
        'Sell him the Holy Toaster (80)',
        () => {
          take('toaster');
          S.f.toasterSold = 1;
          gain(80);
          quote('Doc: "For science." You don\'t ask which science.');
          go('talk', 'doc');
        },
      ]);
    if (!S.f.brainJuice)
      o.push([
        'Drink his Brain Juice (he pays 30)',
        () => {
          S.f.brainJuice = 1;
          gain(30);
          if (roll(S.stats.luck * 7 + 20)) {
            const was = dumb();
            S.stats.brains += 3;
            S.skills.speech += 10;
            S.skills.science += 10;
            say(
              was
                ? "Words arrive. Lots of them. You realise you've been an idiot your whole life. (+3 Brains)"
                : 'Your thoughts get sharper. (+3 Brains, +10 Speech and Science)',
            );
          } else {
            S.maxhp -= 5;
            S.hp = Math.min(S.hp, S.maxhp);
            bad('You can taste colours now. Mostly beige. -5 max HP.');
          }
          go('talk', 'doc');
        },
      ]);
    if (!S.f.kidney)
      o.push([
        'Sell him a kidney (+90 teeth, -8 max HP)',
        () => {
          S.f.kidney = 1;
          S.maxhp -= 8;
          S.hp = Math.min(S.hp, S.maxhp);
          gain(90);
          quote('Doc: "You had two! Greedy."');
          go('talk', 'doc');
        },
      ]);
    if (S.stats.brains >= 7 && !S.f.docFix)
      o.push([
        '"Your ratios are backwards, Doc."',
        () => {
          S.f.docFix = 1;
          give('buzz', 2);
          S.n.doc.op += 20;
          quote('Doc: "...That\'s why they kept exploding." He gives you 2 Buzz.');
          go('talk', 'doc');
        },
      ]);
    o.push(
      canTry('doc.buzz') && [
        'Steal some Buzz' + hint('doc.buzz'),
        () => {
          if (attempt('doc.buzz')) {
            give('buzz', 2);
            say('Two hits of Buzz, pocketed.');
          } else {
            bad("He throws a jar of something. It's still moving. -4 HP.");
            S.n.doc.op -= 20;
            if (hurt(4, 'Killed by a thrown jar of something.')) return;
          }
          go('talk', 'doc');
        },
      ],
    );
    return {
      t: 'Doc Ratchet. His degree is a cereal box with DOCTOR on it. "What\'s broken, besides your spirit?"',
      o,
    };
  },
  opal: () => {
    const o = [],
      f = S.f;
    const free = heard('opal', 'freed'),
      price = free ? 0 : cost(30, 'opal');
    if (free && !f.opalSecret)
      o.push([
        '"You heard about Chainfield?"',
        () => {
          f.opalSecret = 1;
          learnSilo();
          know('silo.back');
          gain(50);
          quote(
            'Opal: "Everyone heard. So here\'s something nobody hears. Silo 9 has a drainage door on the north side. The Molars forget it\'s there."',
          );
          go('talk', 'opal');
        },
      ]);
    o.push([
      free ? 'Company, on the house' : `Pay for company (${price})`,
      () => {
        if (!pay(price)) return go('talk', 'opal');
        say(
          dumb()
            ? "You tell Gloria about your favourite rocks for an hour. She says it's her best night in years. You feel wonderful."
            : pick([
                'An hour with Gloria, who laughs like a cement mixer. You come out missing a sock.',
                'An hour with Rex, who calls you "partner" and smells of gun oil and cinnamon.',
              ]),
        );
        heal(10);
        if (!perk('gut') && !f.rash && !roll(S.stats.luck * 8 + 30)) {
          f.rash = 1;
          S.maxhp -= 5;
          S.hp = Math.min(S.hp, S.maxhp);
          bad('It itches. Wasteland Rash. -5 max HP until Doc fixes it.');
        }
        go('talk', 'opal');
      },
    ]);
    if (!f.opalJob)
      o.push([
        '"Any work?"',
        () => {
          f.opalJob = 1;
          quote('Opal: "Krug took my sister. Sold her twice. Bring me his death and I\'ll pay 150."');
          go('talk', 'opal');
        },
      ]);
    if (f.opalJob && !alive('krug') && !f.opalPaid)
      o.push([
        '"Krug is dead."',
        () => {
          f.opalPaid = 1;
          karma(1);
          gain(150);
          gainXP(100);
          if (f.krugPaid1) addTitle('Paid Twice for One Corpse');
          quote('Opal pours two drinks. "To my sister."');
          go('talk', 'opal');
        },
      ]);
    o.push(newsOpt('opal', '"Nothing I\'d repeat for free."'));
    return {
      t: 'The Velvet Rad. Madame Opal: warm smile, shotgun under the counter. "Everything costs, sugar. Including looking."',
      o,
    };
  },
  jeb: () => {
    const o = [],
      f = S.f,
      c = Math.round(cost(300, 'jeb') * (1 + 0.1 * (S.f.jebUp || 0)));
    if (heard('jeb', 'rescued', 'pete') && !f.jebThanks) {
      f.jebThanks = 1;
      f.jebCheap = 1;
      quote('Jeb: "Pete told me what you did. You ride half price. You ride WITH me, not with the lizards."');
    }
    if (!f.jebQ)
      o.push([
        '"Need anything?"',
        () => {
          f.jebQ = 1;
          quote(
            'Jeb: "Two guards, Pete and Sal, went to Mama Lou\'s for lunch. Never came back. 100 teeth to find out."',
          );
          go('talk', 'jeb');
        },
      ]);
    if (f.jebQ && !f.jebPaid && alive('pete') && S.n.pete.loc === 'rustwater')
      o.push([
        '"Pete\'s back."',
        () => {
          f.jebPaid = 1;
          karma(2);
          gain(100);
          gainXP(100);
          quote('Jeb: "And Sal?" Pete: "Sal was the soup of the day."');
          go('talk', 'jeb');
        },
      ]);
    if (f.jebQ && !f.jebPaid && has('badge') && (!alive('pete') || S.n.pete.loc === 'cage'))
      o.push([
        'Show him the badges',
        () => {
          take('badge');
          f.jebPaid = 1;
          gain(40);
          gainXP(50);
          S.n.lou.op -= 10;
          quote('Jeb: "Lou\'s. Should\'ve known. Her stew always tasted like somebody."');
          go('talk', 'jeb');
        },
      ]);
    o.push([
      `Ride the caravan east, forever (${f.jebCheap ? Math.round(c / 2) : c} teeth)`,
      () => {
        if (pay(f.jebCheap ? Math.round(c / 2) : c)) {
          S.end = { type: 'caravan' };
          go('ending');
        } else go('talk', 'jeb');
      },
      'danger',
    ]);
    const haggle = k => () => {
      if (attempt(k)) {
        f.jebCheap = 1;
        quote('Jeb: "Half price. You ride with the lizards."');
      } else {
        f.jebUp = (f.jebUp || 0) + 1;
        quote('Jeb: "Price just went up. Keep talking, it\'ll go up again."');
      }
      go('talk', 'jeb');
    };
    if (!f.jebCheap && canTry('jeb.haggle')) {
      o.push(['"Half price, and I ride with the lizards."' + hint('jeb.haggle'), haggle('jeb.haggle')]);
      if (f.jebPaid)
        o.push(['"I found your guard. That should be worth a discount."' + hint('jeb.found'), haggle('jeb.found')]);
    }
    if (!knew('jeb.drinks'))
      o.push([
        '"Rough trip?"',
        () => {
          know('jeb.drinks');
          quote('Jeb: "Every trip. That\'s why God made gin." He takes a long pull from a flask.');
          go('talk', 'jeb');
        },
      ]);
    o.push(newsOpt('jeb', '"Roads are quiet. Too quiet. I hate saying that."'));
    return {
      t: 'Caravan Jeb. Six pack-lizards and a cart. Heading east, past the mountains. "They say it\'s green."',
      o,
    };
  },
  pete: () => ({
    t: alive('pete') && S.n.pete.loc === 'rustwater' ? 'Pete, alive. "I\'m never eating meat again."' : 'Pete.',
    o: [newsOpt('pete', '"I still dream about the hooks."')],
  }),
  teo: () => ({
    t:
      S.n.teo.loc === 'rustwater'
        ? 'Old Teo. Free. Still broke. Smiling anyway.'
        : 'Old Teo has named all the trolleys in his pen.',
    o: [
      [
        '"How did you end up here?"',
        () => {
          quote('Teo: "Sold myself. Three meals a day, no rent. Turns out the rent is your whole life."');
          go('talk', 'teo');
        },
      ],
      S.f.knowSilo && !knew('king.mother')
        ? [
            '"What do you know about the King?"',
            () => {
              know('king.mother');
              quote(
                'Teo: "Dentist\'s boy. His mother ran the practice. He still talks to her. She\'s been dead forty years."',
              );
              go('talk', 'teo');
            },
          ]
        : null,
      [
        '"Who buys from Krug?"',
        () => {
          learnSilo();
          quote(
            'Teo: "The Dentist King. Silo 9, east. He works diggers to death down there. Digging for something big."',
          );
          go('talk', 'teo');
        },
      ],
    ],
  }),
  hector: () => {
    const f = S.f,
      o = [];
    if (knows('hector', 'sold', 'bess') && S.n.bess.loc === 'pen' && !f.bessQ)
      return {
        t: '"Jeb says you sold my Bess to Krug." The shotgun isn\'t pointed at you. Yet.',
        o: [
          [
            '"I\'ll bring her back."',
            () => {
              f.bessQ = 1;
              S.n.hector.op = Math.max(S.n.hector.op, -30);
              gain(100);
              quote('Hector: "Then go. Here\'s 100 teeth to buy her back. Krug sells on after a few days."');
              go('talk', 'hector');
            },
          ],
          canTry('hector.lying') && [
            '"Jeb\'s lying."' + hint('hector.lying'),
            () => {
              if (attempt('hector.lying')) {
                S.n.hector.op = Math.max(S.n.hector.op, -20);
                quote('Hector: "...Jeb does drink." The gun goes down. For now.');
                go('talk', 'hector');
              } else {
                bad('Hector: "Liar."');
                S.n.hector.op = -100;
                fight([foe('hector')], { win: 'back', back: ['map'] });
              }
            },
          ],
          knew('jeb.drinks') &&
            canTry('hector.lying') && [
              '"Jeb was drunk when he said it. You know how he gets."' + hint('hector.drunk'),
              () => {
                if (attempt('hector.drunk')) {
                  S.n.hector.op = Math.max(S.n.hector.op, -20);
                  quote('Hector: "...He was at the gin, yeah." The gun goes down. For now.');
                  go('talk', 'hector');
                } else {
                  bad('Hector: "Drunk or not, Jeb don\'t lie about Bess."');
                  S.n.hector.op = -100;
                  fight([foe('hector')], { win: 'back', back: ['map'] });
                }
              },
            ],
        ],
      };
    let t = '"What." Hector doesn\'t do questions.';
    if (f.bessHome && alive('bess')) t = '"You brought her home. I still want to shoot you. Less, though."';
    else if (f.bessQ && S.n.bess.loc === 'pen') t = '"Well? Where is she?"';
    o.push([
      '"Your kids ever leave the farm?"',
      () => {
        quote(
          'Hector: "Bess is 29, Bert is 31. Neither leaves this farm. Not since the Hendersons went to Lou\'s for dinner and became dinner."',
        );
        go('talk', 'hector');
      },
    ]);
    if (!S.weapons.includes('shotgun'))
      o.push([
        `Buy his shotgun (${cost(200, 'hector')})`,
        () => {
          if (pay(cost(200, 'hector'))) {
            S.weapons.push('shotgun');
            quote('Hector: "Treat her right." He goes inside to cry.');
          }
          go('talk', 'hector');
        },
      ]);
    o.push(newsOpt('hector', '"Jeb tells me things. Today he told me nothing."'));
    return { t, o };
  },
  bess: () => {
    const n = S.n.bess,
      f = S.f;
    if (n.loc === 'pen') return penTalk('bess');
    const sold = knows('bess', 'sold', 'bess');
    const o = [
      [
        '"What do you do for fun out here?"',
        () => {
          quote(
            sold
              ? 'Bess: "Krug fed us once a day. I thought about you every meal."'
              : 'Bess: "Daddy says outside is full of killers. It sounds amazing."',
          );
          if (!sold) know('bess.dreams');
          go('talk', 'bess');
        },
      ],
    ];
    if (!S.spouse && !f.spouseFate && !sold && canTry('bess.leave')) {
      o.push(['"Ever thought about leaving this farm?"' + hint('bess.leave'), () => flirt('bess.leave')]);
      o.push(['"You must be the prettiest girl in the county."' + hint('bess.pretty'), () => flirt('bess.pretty')]);
    }
    return {
      t: sold
        ? '"You sold me." She keeps sharpening her hoe. She looks at you while she does it.'
        : 'Bess, 29, has been "about to leave" for eleven years. Sharpening a hoe that doesn\'t need it.',
      o,
    };
  },
  bert: () => {
    const n = S.n.bert,
      f = S.f;
    if (n.loc === 'pen') return penTalk('bert');
    const o = [
      [
        '"Read anything good lately?"',
        () => {
          quote('Bert: "A tractor can pull eight times its own weight." You know that now. Forever.');
          go('talk', 'bert');
        },
      ],
    ];
    return { t: 'Bert, 31, has read the same tractor magazine every night of his adult life.', o };
  },
  lou: () => {
    const o = [],
      f = S.f;
    if (!f.louAsk) {
      o.push([
        '"Seen two caravan guards? Pete and Sal?"' + hint('lou.guards'),
        () => {
          f.louAsk = 1;
          quote(
            attempt('lou.guards')
              ? 'Lou: "Pete and Sal? Lovely boys. Sal was so tender..." She stops. "Never seen \'em. More stew?"'
              : 'Lou: "Never seen \'em, honey. More stew?" Junior stops chopping.',
          );
          go('talk', 'lou');
        },
      ]);
      if (knew('lou.polish'))
        o.push([
          '"Sal\'s Sunday Best. Lovely polish. I found some in my stew."' + hint('lou.polish'),
          () => {
            f.louAsk = 1;
            quote(
              attempt('lou.polish')
                ? 'Lou: "You do notice things, honey." The smile stays. The eyes don\'t. "Pete\'s still fresh. Tuesday."'
                : 'Lou: "Lots of girls wear that, honey." Junior stops chopping.',
            );
            go('talk', 'lou');
          },
        ]);
    }
    if (!f.louConfront)
      o.push([
        '"I know what\'s in the stew."',
        () => {
          f.louConfront = 1;
          go('confront');
        },
      ]);
    if (f.louFriend || f.cannibal)
      o.push([
        '"Got any work?"',
        () => {
          quote('Lou: "Fresh meat, sweetie. Pigs, people. I pay well."');
          go('talk', 'lou');
        },
      ]);
    if (has('pig'))
      o.push([
        `Sell her Bacon Prime (${perk('butcher') ? 80 : 40})`,
        () => {
          take('pig');
          f.pigFate = 'stew';
          gain(perk('butcher') ? 80 : 40);
          quote('Lou: "Pedigree. You can taste a pedigree."');
          go('talk', 'lou');
        },
      ]);
    if (S.spouse)
      o.push([
        `Sell your spouse, ${NPC[S.spouse].n}, for stew (${perk('butcher') ? 400 : 200})`,
        () => sellSpouse('lou'),
        'danger',
      ]);
    return {
      t: f.louReformed
        ? 'Lou winks. The menu says MOLE-DOG STEW now. Probably.'
        : 'Mama Lou, built like a fridge. "Sit down, honey. You look delicious. Hungry! You look hungry."',
      o,
    };
  },
  junior: () => ({ t: 'Junior, 44, built like a bigger fridge. He grunts and keeps chopping.', o: [] }),
  krug: () => {
    const o = [],
      f = S.f;
    if (S.spouse)
      o.push([
        `Sell your spouse, ${NPC[S.spouse].n} (${perk('butcher') ? 600 : 300})`,
        () => sellSpouse('krug'),
        'danger',
      ]);
    ['bess', 'bert'].forEach(x => {
      if (alive(x) && S.n[x].loc === 'pen')
        o.push([
          `Buy back ${NPC[x].n} (${cost(400, 'krug')})`,
          () => {
            if (pay(cost(400, 'krug'))) {
              quote('Krug: "Returns policy. Restocking fee is fifty percent. Kidding. It\'s included."');
              go('freed1', x);
            } else go('talk', 'krug');
          },
        ]);
    });
    if (has('pig'))
      o.push([
        'Sell him Bacon Prime',
        () => {
          take('pig');
          f.pigFate = 'slave';
          gain(10);
          quote('Krug laughs till he cries. "Ten teeth. He can pull a cart."');
          go('talk', 'krug');
        },
      ]);
    if (!f.slaver)
      o.push([
        f.soldSomeone ? '"I want in."' : '"I want in." (sell someone, or pay 100)',
        () => {
          if (f.soldSomeone) tattoo();
          else if (pay(100)) tattoo();
          else go('talk', 'krug');
        },
      ]);
    o.push([
      '"Who buys your diggers?"',
      () => {
        learnSilo();
        quote('Krug: "The Dentist King. Silo 9, out east. He pays in teeth. Digging for something big."');
        go('talk', 'krug');
      },
    ]);
    o.push([
      'Sell yourself',
      () => {
        S.end = { type: 'sold' };
        go('ending');
      },
      'danger',
    ]);
    return {
      t: f.slaver
        ? '"Colleague! How\'s the ink healing?"'
        : 'Krug. Huge, polite, immaculate records. "Everything has a price. Mostly people."',
      o,
    };
  },
};
function moeWord() {
  const f = S.f,
    op = S.n.moe.op;
  // Moe deals in rumours. He stops giving them to people he doesn't like, and lies to people he hates.
  if (op <= -40 && alive('krug') && !f.freed && !knew('moe.lie')) {
    know('moe.lie');
    return '"Krug went east with a buyer. Half his guards with him. Tonight\'s the night for those pens, if you\'re brave."';
  }
  if (op <= -20) return '"Nothing for you." He keeps wiping the glass.';
  if (S.day >= 6 && !f.knowSilo && roll(60)) {
    learnSilo();
    return '"Molars. Raiders in tooth necklaces. They come from an old silo out east, past the plane."';
  }
  if (S.day >= 8 && !f.raid && !f.knowRaid && !f.kingStopped) {
    f.knowRaid = 1;
    return '"Molars are sniffing round town, counting our guns. Something\'s coming. Soon."';
  }
  const n = news('moe', null);
  if (n && roll(70)) return n.replace('"Heard', '"Word is');
  const w = pick([
    '"Jeb drinks like a lizard at a puddle. Believes half what he hears, repeats all of it."',
    '"Lou\'s stew is the best in the wastes. Nobody asks what\'s in it."',
    '"The Mayor keeps a ledger in his fridge desk. Next to his feelings."',
    '"Krug buys anything that walks. Opal wants him dead."',
    '"There\'s a dead plane out east. Very quiet passengers."',
    '"Doc pays you to drink his stuff. Last guy can hear the colour blue."',
  ]);
  if (w.startsWith('"Jeb drinks')) know('jeb.drinks');
  return w;
}
SC.confront = () =>
  show({
    title: "Mama Lou's",
    icon: '🍲',
    text: 'Lou keeps wiping the counter. "Everybody knows, sweetie. Nobody asks. That\'s the deal." Junior cracks his knuckles. All of them.',
    opts: [
      [
        '"I want in."',
        () => {
          S.f.louFriend = 1;
          addTitle('Friend of Mama Lou');
          karma(-2);
          S.n.lou.op += 30;
          S.n.junior.op += 30;
          quote('Lou: "I knew I liked you! You eat free, forever."');
          go('hub', 'diner');
        },
      ],
      [
        S.stats.brawn >= 9
          ? 'Hold Junior over the stew pot'
          : '"Dead customers don\'t come back, Lou. Think of the repeat business."' + hint('lou.stop'),
        () => {
          if (S.stats.brawn >= 9 || attempt('lou.stop')) {
            S.f.louReformed = 1;
            karma(3);
            gainXP(150);
            addTitle('Reformer of Cannibals');
            say(
              S.stats.brawn >= 9
                ? 'You hold Junior over the stew pot. Lou agrees to switch to mole-dog.'
                : "Repeat business, you explain. Dead customers don't come back. She sighs and switches to mole-dog.",
            );
            go('hub', 'diner');
          } else {
            bad('"Nobody tells Mama Lou what to cook."');
            fight(crew('lou'), { win: 'kitchenwin', back: ['map'] });
          }
        },
      ],
      ['Fight them both', () => fight(crew('lou'), { started: true, win: 'kitchenwin', back: ['map'] }), 'danger'],
      ['"Never mind. Great stew."', () => go('hub', 'diner')],
    ],
  });
