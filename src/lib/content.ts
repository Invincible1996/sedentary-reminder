import { Language, ReminderType } from "../types";

export interface ReminderCopy {
  title: string;
  body: string;
}

/** 每种语言、每种提醒的文案池,触发时随机选一条。 */
export const REMINDER_COPY: Record<Language, Record<ReminderType, ReminderCopy[]>> = {
  zh: {
    exercise: [
      {
        title: "久坐终结者！是时候站起来了",
        body: "身体是革命的本钱。已经在椅子上坐了很久啦，你的脊椎、腰椎和关节正在承受无声的压力。现在请站起身来，伸展双臂，做几次深呼吸，或者去窗前远眺 2 分钟。短暂的离开并不是偷懒，而是为了以更饱满的精神状态重新投入工作。",
      },
      {
        title: "给身体来一次「重启」",
        body: "长时间保持同一个姿势，肌肉会逐渐变得僵硬，血液循环也会变慢。请立刻站起来，扭扭脖子、耸耸肩，做个深呼吸，或者做几个原地的深蹲。让新鲜的氧气流向大脑，唤醒僵硬的身体，你会发现思维比刚才更加敏锐。",
      },
      {
        title: "小别座椅，大有裨益",
        body: "研究表明，每坐 1 小时起身活动 2 分钟，能降低诸多健康风险。闭上眼，揉揉发酸的肩膀，活动一下手腕，走到窗边深呼吸。这不仅仅是短暂的休息，更是一次对健康的自我投资。照顾好自己，才能在长跑中走得更远。",
      },
      {
        title: "站立，呼吸，伸展",
        body: "你的身体正在发出疲劳信号。请起立，将双臂高高举过头顶，用力伸个懒腰，感受背部肌肉的拉伸与放松。然后，离开工位走动几步，晃动一下双腿。让紧绷的神经放松下来，给承重已久的下肢肌肉放个短假。",
      },
      {
        title: "把疲劳赶走，唤醒全新活力",
        body: "工作再忙，也不要忽略身体的抗议。站起身来，做几次头部环绕以放松紧绷的颈椎。做 10 个简单的垫脚提踵运动，让小腿肌肉泵出新鲜血液。重塑活力的秘诀就藏在这些短暂的站立与舒展之中。",
      },
      {
        title: "打断久坐，让大脑深呼吸",
        body: "连续专注工作会让大脑效率逐渐降低，久坐更会让身体代谢放缓。现在就是最棒的休息契机！站起来去接杯温水、或者在走廊踱步片刻。打断久坐的恶性循环，给大脑一个空档期，灵感往往就在此时悄然浮现。",
      },
    ],
    water: [
      {
        title: "身体的「水合」时刻到了",
        body: "水是生命之源。当你的身体开始缺水时，专注力、记忆力和工作效率都会悄然下降。请现在端起水杯，小口慢饮，温润你的喉咙与胃部。让水分充盈每个细胞，带走代谢废物，为身体注入源源不断的清爽与活力。",
      },
      {
        title: "别等口渴，现在就补充水分",
        body: "你知道吗？当你感到口渴时，身体其实已经处于轻度缺水状态了。缺水会引发疲劳、干涩甚至是情绪波动。请停下手中的忙碌，倒上一杯温开水，一口一口喝下去。这是对身体最温柔的呵护，简单却非常有效。",
      },
      {
        title: "用一杯清泉，唤醒深度专注",
        body: "觉得脑子转得有点慢，或者眼睛有些干涩？这可能是大脑在发出缺水信号。去倒一杯温热的水吧，看着腾起的热气，静静地喝下它。水分能促进脑部血液循环，迅速帮你赶走疲惫，重新找回高效专注的自己。",
      },
      {
        title: "健康，从喝好这杯水开始",
        body: "喝水是最简单也最廉价的养生方式。规律的补水不仅能维持代谢、滋润皮肤，还能保护你的肾脏。请倒一杯温水，慢慢喝完，感受水流拂过口腔、滑入胃部的舒适感。让良好的饮水习惯，成为你健康生活里的坚实基石。",
      },
      {
        title: "给身体细胞「做个SPA」",
        body: "工作再忙，也别忘了给身体补水。温水是最好的天然清道夫，能够润滑关节、促进肠胃蠕动。请现在就起立，去倒杯新鲜的水，站在窗边慢慢饮下。让水分像雨露一样滋润干涸的身体细胞，保持一整天的水润与健康。",
      },
      {
        title: "一杯温水，温润疲惫身心",
        body: "在忙碌的代码和文档世界里，也请给自己保留片刻温存。倒上一杯清澈的水，轻轻吹散水面的热气，小口啜饮。这几分钟里，什么都不要想，只专注于水流带来的温润与放松。补足水分，重新出发，工作也会更轻松。",
      },
    ],
  },
  en: {
    exercise: [
      {
        title: "Sedentary Terminator! Time to Stand Up",
        body: "Health is your greatest asset. You've been sitting for a long time, and your spine, lower back, and joints are bearing silent pressure. Please stand up now, stretch your arms, take a few deep breaths, or look out the window for 2 minutes. A short break is not slacking; it helps you return to work with renewed energy.",
      },
      {
        title: "Give Your Body a 'Reboot'",
        body: "Staying in the same position for long periods makes muscles stiff and slows blood circulation. Stand up immediately, roll your neck, shrug your shoulders, take a deep breath, or do a few squats. Let fresh oxygen flow to your brain and wake up your body; you'll find your mind much sharper.",
      },
      {
        title: "Step Away for Better Health",
        body: "Studies show that standing up for 2 minutes for every hour of sitting reduces health risks. Close your eyes, rub your sore shoulders, rotate your wrists, and walk to the window for a deep breath. This is not just a brief rest; it's an investment in your health. Taking care of yourself helps you go further.",
      },
      {
        title: "Stand, Breathe, Stretch",
        body: "Your body is signaling fatigue. Please stand up, raise your arms high above your head, stretch thoroughly, and feel your back muscles extend and relax. Then walk a few steps and shake out your legs. Let your tense nerves unwind and give your lower limbs a well-deserved short break.",
      },
      {
        title: "Chase Away Fatigue, Awaken Vitality",
        body: "No matter how busy you are, don't ignore your body's protests. Stand up and do some neck rolls to relax your cervical spine. Perform 10 simple heel raises to let your calves pump fresh blood. The secret to rebuilding energy lies in these brief moments of standing and stretching.",
      },
      {
        title: "Break the Chair Cycle, Let Your Mind Breathe",
        body: "Continuous work reduces brain efficiency, and prolonged sitting slows down metabolism. Now is the perfect time for a break! Stand up, get a glass of warm water, or walk down the hallway. Break the sitting cycle and give your mind a pause; inspiration often strikes during these moments.",
      },
    ],
    water: [
      {
        title: "Time for Hydration!",
        body: "Water is the source of life. When your body is dehydrated, focus, memory, and productivity slip away. Pick up your cup now, take slow sips, and soothe your throat and stomach. Let water fill every cell, flush out waste, and bring refreshing vitality back to your body.",
      },
      {
        title: "Don't Wait Until You're Thirsty",
        body: "Did you know? By the time you feel thirsty, your body is already mildly dehydrated. Dehydration leads to fatigue, dry eyes, and mood swings. Pause your work, pour a glass of warm water, and drink it slowly. This simple care is gentle yet highly effective.",
      },
      {
        title: "A Glass of Water for Deep Focus",
        body: "Feeling a bit sluggish or dry-eyed? Your brain might be signaling for water. Go pour a warm glass of water, watch the steam rise, and drink it calmly. Water boosts brain circulation, quickly dispelling fatigue and helping you regain deep focus.",
      },
      {
        title: "Health Starts with a Glass of Water",
        body: "Drinking water is the simplest and cheapest wellness habit. Regular hydration maintains metabolism, moisturizes skin, and protects your kidneys. Pour a glass of warm water, finish it slowly, and enjoy the comfort as it warms you. Let this be a solid pillar of your healthy lifestyle.",
      },
      {
        title: "Give Your Cells a Quick 'SPA'",
        body: "Never get too busy to hydrate. Warm water is a natural cleanser that lubricates joints and aids digestion. Stand up now, pour a fresh cup of water, and drink it slowly by the window. Let hydration nourish your dry cells, keeping you healthy and hydrated all day.",
      },
      {
        title: "Sip Warm Water, Soothe Your Mind",
        body: "In a world of busy code and documents, keep a moment of warmth for yourself. Pour a glass of clear water, gently blow away the steam, and take small sips. Think of nothing else for these few minutes; just focus on the warmth and relaxation of the water. Recharge and restart.",
      },
    ],
  },
};

/** 每种提醒的图标池,全屏时循环播放并带动画。 */
export const REMINDER_ICONS: Record<ReminderType, string[]> = {
  exercise: ["🏃", "🏃‍♀️", "🤸", "🤸‍♀️", "🧘", "🚶", "💪", "🏋️", "🤾", "⛹️", "🙆", "🚴"],
  water: ["💧", "🚰", "🥤", "🫗", "🧊", "🍵", "🚿", "🏺"],
};

export const REMINDER_ACCENT: Record<ReminderType, string> = {
  exercise: "#6366f1",
  water: "#06b6d4",
};

/** 随机选一条文案的下标。 */
export function randomCopyIndex(type: ReminderType, lang: Language): number {
  const pool = REMINDER_COPY[lang][type];
  return Math.floor(Math.random() * pool.length);
}

export function copyAt(type: ReminderType, index: number, lang: Language): ReminderCopy {
  const pool = REMINDER_COPY[lang][type];
  return pool[((index % pool.length) + pool.length) % pool.length];
}
