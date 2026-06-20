---
id: "Phobos"
lang: "zh"
status: "draft"
featured: true
order: 2
title: "战斗循环原型"
role: "玩法 / 系统设计"
summary: "围绕核心战斗节奏、风险回报调校和清晰反馈建立的原型。"
description: "围绕核心战斗节奏、风险回报调校和清晰反馈建立的原型。"
# Add a real project cover at ./img/cover.webp, then set cover to "./img/cover.webp".
cover: ""
visualClass: "systems-card"
coverClass: "systems-cover"
tags: ["Combat Design","Game Systems","Prototype"]
tools: ["Unity","C#"]
date: "2026-05-30"
---
# 战斗循环原型

## 项目概述

这个原型聚焦于紧凑的战斗节奏：读取敌人意图、做出应对承诺，并通过即时反馈解释一次交互为什么成功或失败。

{{ video youtube:M7lc1UVf-VE title="战斗循环原型演示" }}

## 我的职责

- 定义攻击、闪避、恢复和反击窗口。
- 调整近距离承诺行为的风险回报。
- 梳理命中确认、挥空恢复和防御时机的反馈状态。

## 迭代记录

最重要的设计目标是在压力下保持可读性。原型刻意减少操作动词，强化动画预兆，并让每次失败都能被玩家理解，同时不打断战斗流。

## 下一步改进

- 添加第二类敌人，用于测试循环是否能适配不同节奏。
- 制作一段短教学遭遇，在伤害压力前先教授站位。
- 对比玩家录像与预期决策点。
