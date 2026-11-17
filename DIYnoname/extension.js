game.import("extension", function(lib, game, ui, get, ai, _status) {
// 单机身份局：玩家选双将，其他角色只选单将。
// 仅影响本次选将流程，不保存或修改军争双将选项。
function installSoloDoubleCharacter() {
    if (get.mode() !== "identity" || _status.connectMode || game.online || game._diySoloDoubleInstalled) return;
    if (typeof game.chooseCharacter !== "function") return;
    game._diySoloDoubleInstalled = true;
    const originalChoose = game.chooseCharacter;
    game.chooseCharacter = function() {
        if (!lib.config.extension_DIYnoname_soloDouble || _status.mode === "purple") {
            return originalChoose.apply(this, arguments);
        }
        const createEvent = game.createEvent;
        let choiceEvent;
        game.createEvent = function(name) {
            const next = createEvent.apply(this, arguments);
            if (name === "chooseCharacter" && !choiceEvent) {
                choiceEvent = next;
                const setContent = next.setContent;
                next.setContent = function(content) {
                    if (!Array.isArray(content) || content.length < 3) {
                        return setContent.apply(this, arguments);
                    }
                    const settings = lib.config.mode_config && lib.config.mode_config.identity;
                    if (!settings) return setContent.apply(this, arguments);
                    const original = settings.double_character;
                    const restore = () => { settings.double_character = original; };
                    const ai = next.ai;
                    if (typeof ai === "function") {
                        next.ai = function() {
                            const previous = settings.double_character;
                            settings.double_character = false;
                            try {
                                return ai.apply(this, arguments);
                            } finally {
                                settings.double_character = previous;
                            }
                        };
                    }
                    const first = content[0], last = content[content.length - 1];
                    content[0] = async function() {
                        settings.double_character = true;
                        try {
                            return await first.apply(this, arguments);
                        } catch (error) {
                            restore();
                            throw error;
                        }
                    };
                    content[content.length - 1] = async function() {
                        try {
                            return await last.apply(this, arguments);
                        } finally {
                            restore();
                        }
                    };
                    return setContent.call(this, content);
                };
            }
            return next;
        };
        try {
            return originalChoose.apply(this, arguments);
        } finally {
            game.createEvent = createEvent;
        }
    };
}

	return {name:"DIYnoname",editable:true,connect:false,arenaReady:function(){
    installSoloDoubleCharacter();
},content:function(config,pack){
    
},prepare:function(){
    
},precontent:function(config){
    installSoloDoubleCharacter();
},help:{},config:{
    soloDouble: {
        name: "单机军争仅自己双将",
        intro: "单机身份模式下，你选择两名武将，其他角色仍为单将。联机模式不生效。",
        init: false,
    },
},package:{
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
            "孙寒华": {
                sex: "female",
                group: "shen",
                hp: 6,
                maxHp: 6,
                hujia: 0,
                skills: ["diy_chongxu","diy_miaojian","diy_lianhua","dchuiling","diy_dcchongxu"],
                isAiForbidden: true,
                img: "extension/DIYnoname/孙寒华.jpg",
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
        characterIntro: {
            "孙寒华": "孙寒华，吴地女冠，传为孙氏宗室之女。自幼慕道，远离纷争，潜心修习道法。其人清静自持，心怀济世之念，后世留下诸多传说。",
        },
        translate: {
            "蔡琰": "蔡琰",
            "DIYnoname": "DIYnoname",
            "玄德": "玄德",
            "黄盖": "黄盖",
            "孙寒华": "孙寒华",
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

            // 孙寒华：保留手杀原配音，改变冲虚得分与妙剑、莲华的升级方式。

            // 新杀孙寒华：汇灵原样使用官方 dchuiling；青荒原样使用 dcqinghuang。
            "diy_dcchongxu": {
                audio: "dcchongxu",
                enable: "phaseUse",
                usable: 1,
                derivation: ["diy_dctaji", "dcqinghuang"],
                filter(event, player) {
                    return player.countMark("dchuiling") >= 4;
                },
                prompt(event, player) {
                    const num = player.countMark("dchuiling");
                    const bonus = player.hasSkill("diy_dctaji") && player.hasSkill("dcqinghuang")
                        ? "摸" + num + "张牌"
                        : "获得【踏寂】和【青荒】";
                    return "移去所有“灵”，增加" + num + "点体力上限，然后" + bonus + "（保留【汇灵】）";
                },
                async content(event, trigger, player) {
                    const num = player.countMark("dchuiling");
                    if (num < 4) return;
                    const hasBoth = player.hasSkill("diy_dctaji") && player.hasSkill("dcqinghuang");
                    player.removeMark("dchuiling", num);
                    await player.gainMaxHp(num);
                    if (hasBoth) {
                        await player.draw(num);
                    } else {
                        const missing = ["diy_dctaji", "dcqinghuang"].filter(skill => !player.hasSkill(skill));
                        if (missing.length) await player.addSkills(missing);
                    }
                },
                ai: {
                    combo: "dchuiling",
                    order: 10,
                    result: { player: 1 },
                },
            },
            "diy_dctaji": {
                audio: "dctaji",
                trigger: {
                    player: "loseEnd",
                    global: ["equipEnd", "addJudgeEnd", "gainEnd", "loseAsyncEnd", "addToExpansionEnd"],
                },
                forced: true,
                locked: false,
                filter(event, player) {
                    const evt = event.getl(player);
                    return !!(evt && evt.hs && evt.hs.length);
                },
                async content(event, trigger, player) {
                    const evt = trigger.getParent();
                    const effects = [
                        ["useCard", async (event, trigger, player) => {
                            const targets = game.filterPlayer(current =>
                                current !== player && current.countDiscardableCards(player, "he")
                            );
                            if (!targets.length) return;
                            // 与原版唯一的行为差异：不再强制选择目标。
                            const result = await player.chooseTarget(
                                "踏寂：你可以弃置其他角色一张牌", 
                                (card, player, target) => get.event().targets.includes(target)
                            ).set("targets", targets)
                             .set("ai", target => get.effect(target, { name: "guohe_copy2" }, get.player()))
                             .forResult();
                            if (result?.bool && result.targets?.length) {
                                const target = result.targets[0];
                                player.line(target);
                                await player.discardPlayerCard(target, "he", true);
                            }
                        }],
                        ["respond", async (event, trigger, player) => {
                            await player.draw();
                        }],
                        ["discard", async (event, trigger, player) => {
                            await player.recover();
                        }],
                        ["other", async (event, trigger, player) => {
                            player.addSkill("dctaji_damage");
                            player.addMark("dctaji_damage", 1, false);
                            game.log(player, "下一次对其他角色造成的伤害", "#g+1");
                        }],
                    ];
                    let name = evt.name;
                    if (trigger.name === "loseAsync") name = evt.type;
                    const list = ["useCard", "respond", "discard", "other"];
                    if (!list.includes(name)) name = "other";
                    for (let i = 0; i < 1 + player.countMark("dcqinghuang_add"); i++) {
                        if (!list.length) break;
                        if (!list.includes(name)) name = list.randomRemove(1)[0];
                        if (name === "useCard") list.remove("useCard");
                        for (const effect of effects) {
                            if (effect[0] === name) {
                                list.remove(name);
                                const next = game.createEvent("diy_dctaji_" + name);
                                next.player = player;
                                next.setContent(effect[1]);
                                await next;
                                break;
                            }
                        }
                    }
                },
                ai: { combo: "dcqinghuang" },
            },
            "diy_chongxu": {
                audio: "chongxu",
                enable: "phaseUse",
                usable: 1,
                async content(event, trigger, player) {
                    let score = 5;
                    while (score >= 2) {
                        const controls = [];
                        const descriptions = [];
                        if (score >= 3 && player.hasSkill("diy_miaojian") && player.countMark("diy_miaojian") < 2) {
                            controls.push("升级妙剑");
                            descriptions.push("消耗3分：妙剑每回合可额外使用一次");
                        }
                        if (score >= 3 && player.hasSkill("diy_lianhua") && player.countMark("diy_lianhua") < 2) {
                            controls.push("升级莲华");
                            descriptions.push("消耗3分：莲华每次额外摸两张牌");
                        }
                        if (score >= 2) {
                            controls.push("摸一张牌");
                            descriptions.push("消耗2分：摸一张牌");
                        }
                        controls.push("结束分配");
                        descriptions.push("放弃剩余积分");
                        const result = await player.chooseControl(controls)
                            .set("prompt", "冲虚：本次剩余" + score + "分")
                            .set("choiceList", descriptions)
                            .set("ai", function () {
                                const evt = get.event(), choices = evt.controls;
                                if (choices.includes("升级莲华")) return "升级莲华";
                                if (choices.includes("升级妙剑")) return "升级妙剑";
                                if (choices.includes("摸一张牌")) return "摸一张牌";
                                return "结束分配";
                            }).forResult();
                        if (!result || result.control === "结束分配" || !controls.includes(result.control)) break;
                        switch (result.control) {
                            case "升级妙剑":
                                score -= 3;
                                player.addMark("diy_miaojian", 1, false);
                                game.log(player, "升级了", "#g【妙剑】", "，当前可使用", player.countMark("diy_miaojian") + 1, "次");
                                break;
                            case "升级莲华":
                                score -= 3;
                                player.addMark("diy_lianhua", 1, false);
                                game.log(player, "升级了", "#g【莲华】", "，每次可摸", 1 + 2 * player.countMark("diy_lianhua"), "张牌");
                                break;
                            case "摸一张牌":
                                score -= 2;
                                await player.draw();
                                break;
                        }
                    }
                },
                ai: { order: 10, result: { player: 1 } },
            },
            "diy_miaojian": {
                audio: "miaojian",
                enable: "phaseUse",
                usable: 3,
                mark: true,
                marktext: "剑",
                intro: { content(storage, player) {
                    return "已升级" + player.countMark("diy_miaojian") + "/2次；每回合最多发动" + (1 + player.countMark("diy_miaojian")) + "次";
                } },
                filter(event, player) {
                    const used = player.getStat("skill")?.diy_miaojian || 0;
                    if (used >= 1 + player.countMark("diy_miaojian")) return false;
                    return event.filterCard({ name: "wuzhong", isCard: true }, player, event) ||
                        event.filterCard({ name: "sha", nature: "stab", isCard: true, storage: { diy_miaojian: true } }, player, event);
                },
                chooseButton: {
                    dialog() {
                        return ui.create.dialog("妙剑", [[
                            ["基本", "", "sha", "stab"],
                            ["锦囊", "", "wuzhong"],
                        ], "vcard"]);
                    },
                    filter(button, player) {
                        const evt = _status.event.getParent();
                        const card = button.link[2] === "sha"
                            ? { name: "sha", nature: "stab", isCard: true, storage: { diy_miaojian: true } }
                            : { name: "wuzhong", isCard: true };
                        return evt.filterCard(card, player, evt);
                    },
                    check(button) {
                        const card = { name: button.link[2], nature: button.link[3] };
                        const player = _status.event.player;
                        return get.value(card, player) * get.sgn(player.getUseValue(card));
                    },
                    backup(links) {
                        const isSha = links[0][2] === "sha";
                        return {
                            audio: "miaojian",
                            filterCard: () => false,
                            selectCard: -1,
                            viewAs: isSha
                                ? { name: "sha", nature: "stab", isCard: true, storage: { diy_miaojian: true } }
                                : { name: "wuzhong", isCard: true },
                            prompt: isSha ? "请选择刺【杀】的目标" : "请选择【无中生有】的目标",
                        };
                    },
                    prompt(links) {
                        return links[0][2] === "sha" ? "请选择刺【杀】的目标" : "请选择【无中生有】的目标";
                    },
                },
                mod: {
                    cardUsable(card, player) {
                        if (card.name === "sha" && card.nature === "stab" && card.storage?.diy_miaojian) return Infinity;
                    },
                },
                group: "diy_miaojian_count",
                subSkill: {
                    backup: { audio: "miaojian" },
                    count: {
                        charlotte: true,
                        forced: true,
                        silent: true,
                        popup: false,
                        trigger: { player: "useCard1" },
                        filter(event) {
                            return event.card?.name === "sha" &&
                                (event.card.storage?.diy_miaojian ||
                                    event.skill === "diy_miaojian_backup" ||
                                    event.getParent()?.skill === "diy_miaojian_backup");
                        },
                        content(event, trigger, player) {
                            if (trigger.addCount !== false) {
                                trigger.addCount = false;
                                const stat = player.getStat("card");
                                if (stat?.sha) stat.sha--;
                            }
                        },
                    },
                },
                ai: { order: 7, result: { player: 1 } },
            },
            "diy_lianhua": {
                audio: "shhlianhua",
                trigger: { target: "useCardToTargeted" },
                forced: true,
                locked: false,
                mark: true,
                marktext: "莲",
                filter(event, player) {
                    return event.card?.name === "sha" && event.player !== player;
                },
                intro: { content(storage, player) {
                    return "已升级" + player.countMark("diy_lianhua") + "/2次；每次触发摸" + (1 + 2 * player.countMark("diy_lianhua")) + "张牌";
                } },
                async content(event, trigger, player) {
                    await player.draw(1 + 2 * player.countMark("diy_lianhua"));
                    if (!trigger.player?.isIn()) {
                        trigger.getParent().excluded.add(player);
                        return;
                    }
                    const eff = get.effect(player, trigger.card, trigger.player, trigger.player);
                    const result = await trigger.player.chooseToDiscard(
                        "he", "弃置一张牌，否则" + get.translation(trigger.card) + "对" + get.translation(player) + "无效"
                    ).set("ai", card => get.event().eff > 0 ? 10 - get.value(card) : 0)
                     .set("eff", eff).forResult();
                    if (!result.bool) trigger.getParent().excluded.add(player);
                },
                ai: { effect: { target_use(card, player, target, current) {
                    if (card.name === "sha" && current < 0) return 0.7;
                } } },
            },
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
            "diy_dcchongxu": "冲虚",
            "diy_dcchongxu_info": "出牌阶段限一次，若你的“灵”不少于4，你可以移去所有“灵”（X为移去的“灵”数），增加X点体力上限，然后若你已有【踏寂】和【青荒】，你摸X张牌；否则你获得【踏寂】和【青荒】。你不会因此失去【汇灵】。",
            "diy_dctaji": "踏寂",
            "diy_dctaji_info": "当你失去手牌后，根据失去牌的原因：使用牌后，你可以弃置一名其他角色的一张牌；打出牌后，你摸一张牌；弃置牌后，你回复1点体力；其他原因，令你下次对其他角色造成的伤害+1。【青荒】的额外效果仍然生效。",
            "diy_chongxu": "冲虚",
            "diy_chongxu_info": "出牌阶段限一次，你获得5分，然后可以消耗3分升级【妙剑】或【莲华】（各最多升级两次），或消耗2分摸一张牌（可重复）。未使用的分数不保留。",
            "diy_miaojian": "妙剑",
            "diy_miaojian_info": "出牌阶段限X次（X为1+升级次数），你可以视为使用一张刺【杀】或【无中生有】。以此法使用刺【杀】不计入使用【杀】的次数。",
            "diy_lianhua": "莲华",
            "diy_lianhua_info": "当你成为其他角色使用【杀】的目标时，你摸X张牌（X为1+升级次数×2）。除非使用者弃置一张牌，否则取消此【杀】对你的效果。",
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
    version: "1.0.3",
},files:{"character":["蔡琰.jpg","张宁.jpg","玄德.jpg","黄盖.jpg","孙寒华.jpg"],"card":[],"skill":[],"audio":[]}} 
});
