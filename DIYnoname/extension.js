game.import("extension", function(lib, game, ui, get, ai, _status) {
	return {name:"DIYnoname",editable:true,connect:false,arenaReady:function(){
    
},content:function(config,pack){
    
},prepare:function(){
    
},precontent:function(config){
    
},help:{},config:{},package:{
    character: {
        character: {
            "蔡琰": {
                sex: "female",
                group: "shen",
                hp: 5,
                maxHp: 5,
                hujia: 0,
                skills: ["dcshuangjia","dcbeifen","beige","boss_hujia","tinqin","boss_huixin","chenjie"],
                isAiForbidden: true,
                img: "extension/DIYnoname/蔡琰.jpg",
            },
            "玄德": {
                sex: "male",
                group: "shu",
                hp: 6,
                maxHp: 6,
                hujia: 0,
                skills: ["dcliexiang","dcrengou","dcrende","xiaoxiong","boss_zhangwu"],
                isZhugong: true,
                isAiForbidden: true,
                img: "extension/DIYnoname/玄德.jpg",
            },
            "黄盖": {
                sex: "male",
                group: "shen",
                hp: 12,
                maxHp: 12,
                hujia: 0,
                skills: ["dcsblieji","dcsbquzhou","reyingzi","sbkurou","sbzhaxiang","zhaxiang"],
                isAiForbidden: true,
                img: "extension/DIYnoname/黄盖.jpg",
            },
            "张宁": {
                sex: "male",
                group: "shen",
                hp: 5,
                maxHp: 5,
                hujia: 0,
                skills: ["tianze","地法","惊蛰","显道","引霆"],
                isZhugong: true,
                isAiForbidden: true,
                img: "extension/DIYnoname/张宁.jpg",
            },
        },
        translate: {
            "蔡琰": "蔡琰",
            "DIYnoname": "DIYnoname",
            "玄德": "玄德",
            "黄盖": "黄盖",
            "张宁": "张宁",
        },
    },
    card: {
        card: {
        },
        translate: {
        },
        list: [],
    },
    skill: {
        skill: {
            "地法": {
                usable: 1,
                group: "地法_reset",
                subSkill: {
                    reset: {
                        trigger: { source: "damageSource" },
                        forced: true,
                        silent: true,
                        popup: false,
                        charlotte: true,
                        filter(event, player) {
                            return event.hasNature("thunder") && event.num > 0;
                        },
                        content(event, trigger, player) {
                            const stat = player.getStat();
                            if (stat.triggerSkill) {
                                delete stat.triggerSkill["地法"];
                            }
                        },
                    },
                },
                trigger: {
                    player: "gainAfter",
                },
                filter(event, player) {
                  if (player != _status.currentPhase) {
                    return false;
                  }
                  var hs = player.getCards("h");
                  if (!hs.length) {
                    return false;
                  }
                  for (var i of event.cards) {
                    if (hs.includes(i) && get.color(i, player) == "red" && lib.filter.cardDiscardable(i, player, "difa")) {
                      return true;
                    }
                  }
                  return false;
                },
                async cost(event, trigger, player) {
                  let hs = player.getCards("h"), cards2 = trigger.cards.filter(function(i) {
                    return hs.includes(i) && get.color(i, player) == "red" && lib.filter.cardDiscardable(i, player, "difa");
                  }), tricks = [];
                  for (let i = 0; i < ui.cardPile.childNodes.length; i++) {
                    let card = ui.cardPile.childNodes[i], type = get.type2(card, false);
                    if (type != "trick" || tricks.includes(type)) {
                      continue;
                    }
                    tricks.push([card.name, get.event().player.getUseValue(card)]);
                  }
                  for (let i = 0; i < ui.discardPile.childNodes.length; i++) {
                    let card = ui.discardPile.childNodes[i], type = get.type2(card, false);
                    if (type != "trick" || tricks.includes(type)) {
                      continue;
                    }
                    tricks.push([card.name, get.event().player.getUseValue(card)]);
                  }
                  tricks.sort((a, b) => b[1] - a[1]);
                  let result = await player.chooseToDiscard(get.prompt2(event.skill), (card) => {
                    return get.event().cards.includes(card);
                  }).set("ai", (card) => {
                    let val = get.event().val;
                    if (typeof val !== "number") {
                      return 0;
                    }
                    return val - get.value(card);
                  }).set(
                    "val",
                    (function() {
                      if (!tricks.length) {
                        return false;
                      }
                      return 3 * tricks[0][1];
                    })()
                  ).set("cards", cards2).set("chooseonly", true).forResult();
                  event.result = {
                    bool: result.bool,
                    cards: result.cards,
                    cost_data: tricks
                  };
                },
                async content(event, trigger, player) {
                  await player.discard(event.cards);
                  let list = lib.inpile.filter(function(i) {
                    return get.type2(i, false) == "trick";
                  });
                  if (!list.length) {
                    return;
                  }
                  const result = await player.chooseButton(["选择获得一种锦囊牌", [list.map((i) => ["锦囊", "", i]), "vcard"]], true).set("ai", function(button) {
                    var name = button.link[2];
                    for (let i of get.event().list) {
                      if (i[0] == name) {
                        return i[1];
                      }
                    }
                    return 0;
                  }).set("list", event.cost_data).forResult();
                  if (result.bool) {
                    let card = get.cardPile((i) => {
                      return i.name == result.links[0][2];
                    });
                    if (card) {
                      await player.gain(card, "gain2");
                    }
                  }
                },
                "skill_id": "difa",
                "_priority": 0,
            },
            "惊蛰": {
                locked: true,
                forced: true,
                trigger: {
                    source: "damageBegin1",
                },
                async content(event, trigger, player) {
                    game.setNature(trigger, "thunder");
                },
                "skill_id": "leishang",
                "_priority": 0,
            },
            "显道": {
                audio: "xinguidao",
                locked: false,
                trigger: {
                    global: "judge",
                },
                filter(event, player) {
                  return player.countCards("hes") > 0;
                },
                async cost(event, trigger, player) {
                  event.result = await player.chooseCard(`${get.translation(trigger.player)}的${trigger.judgestr || ""}判定为${get.translation(trigger.player.judging[0])}，${get.prompt(event.skill)}`, "hes", (card) => {
                    const player2 = get.player();
                    const mod2 = game.checkMod(card, player2, "unchanged", "cardEnabled2", player2);
                    if (mod2 !== "unchanged") {
                      return mod2;
                    }
                    const mod = game.checkMod(card, player2, "unchanged", "cardRespondable", player2);
                    if (mod !== "unchanged") {
                      return mod;
                    }
                    return true;
                  }).set("ai", (card) => {
                    const trigger2 = get.event().getTrigger();
                    const { player: player2, judging } = get.event();
                    const result = trigger2.judge(card) - trigger2.judge(judging);
                    const attitude = get.attitude(player2, trigger2.player);
                    if (attitude === 0 || result === 0) {
                      if (trigger2.player !== player2) {
                        return 0;
                      }
                      if (game.hasPlayer((current) => get.attitude(player2, current) < 0)) {
                        const checkx = lib.skill.xinleiji.judgeCheck(card, true) - lib.skill.xinleiji.judgeCheck(judging);
                        if (checkx > 0) {
                          return checkx;
                        }
                      }
                      return 0;
                    }
                    let val = get.value(card);
                    if (get.subtype(card) === "equip2") {
                      val /= 2;
                    } else {
                      val /= 7;
                    }
                    if (attitude === 0 || result === 0) {
                      return 0;
                    }
                    if (attitude > 0) {
                      return result - val;
                    }
                    return -result - val;
                  }).set("judging", trigger.player.judging[0]).forResult();
                },
                popup: false,
                async content(event, trigger, player) {
                  const next = player.respond(event.cards, event.name, "highlight", "noOrdering");
                  await next;
                  const { cards: cards2 } = next;
                  if (cards2?.length) {
                    player.$gain2(trigger.player.judging[0]);
                    await player.gain(trigger.player.judging[0]);
                    await player.draw("nodelay");
                    trigger.player.judging[0] = cards2[0];
                    trigger.orderingCards.addArray(cards2);
                    game.log(trigger.player, "的判定牌改为", cards2);
                    await game.delay(2);
                  }
                },
                ai: {
                    rejudge: true,
                    tag: {
                        rejudge: 1,
                    },
                },
                "skill_id": "jun_xiandao",
                "_priority": 0,
            },
            "引霆": {
                locked: true,
                forced: true,
                trigger: {
                    global: "damageEnd",
                },
                filter(event, player) {
                    return event.hasNature("thunder");
                },
                async content(event, trigger, player) {
                    await player.draw();
                },
                "skill_id": "yinting",
                "_priority": 0,
            },
        },
        translate: {
            "地法": "地法",
            "地法_info": "每回合限一次。当你于回合内得到红色牌后，你可以弃置其中一张。然后你选择一个锦囊牌的牌名，并从牌堆/弃牌堆中获得一张此牌名的牌。当你造成雷电伤害后，此技能视为未发动过。",
            "惊蛰": "惊蛰",
            "惊蛰_info": "锁定技，你造成的所有伤害均视为雷电伤害",
            "显道": "显道",
            "显道_info": "一名角色的判定牌生效前，你可以打出一张牌替换之，然后摸一张牌。",
            "引霆": "引霆",
            "引霆_info": "锁定技，当一名角色受到雷电伤害后，你摸一张牌。",
        },
    },
    intro: "自用DIY武将扩展",
    author: "Hadeanyolo",
    diskURL: "",
    forumURL: "",
    version: "1.0.2",
},files:{"character":["蔡琰.jpg","张宁.jpg","玄德.jpg","黄盖.jpg"],"card":[],"skill":[],"audio":[]}} 
});
