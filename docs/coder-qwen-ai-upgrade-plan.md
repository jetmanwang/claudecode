# coder.qwen.ai 对标 Claude Code 网页版：功能对比与产品升级方案

调研日期：2026-10-27

## 0. 资料口径（先读）

- **Claude Code 网页版（claude.ai/code）**：依据 code.claude.com 官方文档（2026 年 10 月版本），功能描述可信度高。
- **coder.qwen.ai（Qwen Coder）**：调研所在的云端环境网络策略拦截了该域名，没能直接打开页面。功能信息来自三类公开资料：搜索引擎收录的页面描述、Qwen 官方博客、QwenLM 组织下的公开 GitHub issue。下文 Qwen 一列用三种标记：
  - ✅ 有公开证据
  - ⚠️ 有，但公开反馈显示不稳定
  - ❓ 没找到公开资料（不代表没有，需实测确认）
- 第 12 节是一份实测核对清单。正式立项前，建议先按清单把 ❓ 项实测一遍，再据此调整优先级。

## 1. 结论摘要

1. **形态差距**：Claude Code 网页版的本质是“Claude Code 这个 Agent 的云端会话”。同一个 Agent 内核跑在隔离 VM 里，浏览器、手机、桌面、终端、Slack 都只是客户端。围绕它有一整套体系：仓库 → 环境 → 会话 → 审阅 → PR → 自动修复 → 编排/定时 → 企业治理。coder.qwen.ai 公开可见的形态，是“聊天 + 云端沙箱 + 发布到 GitHub”的单任务闭环。
2. **稳定性差距**：公开 issue 显示，2026 年 2 月到 10 月间 coder.qwen.ai 持续出现 GitHub 授权失败、多次发布失败、工作区丢失、凭证未注入等问题。核心闭环尚未稳定。
3. **升级路线**：不建议逐项照抄，建议分四步走：
   - 阶段 0：止血，把核心闭环做稳；
   - 阶段 1：用开源 Qwen Code 做云端统一内核，对齐会话/分支/环境/审阅/PR；
   - 阶段 2：补跨端连续性（终端↔云、手机、远程接管）和 PR 自动修复；
   - 阶段 3–4：做多任务编排、定时/事件自动化、Code Review 服务和企业级治理。
4. **差异化**：Qwen 手里有 Claude 没有的牌：开放权重模型可私有化推理、国内代码托管与 IM 生态、价格、Web 预览与一键部署。这些应和对标工作同步规划，而不是只做跟随。

## 2. 产品定位对比

| | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| 官方定位 | 在云端运行 Claude Code 会话；关掉电脑也继续跑，可从任何设备查看和接管 | “在安全云端沙箱里写功能、修 bug、生成 Pull Request 的编码 Agent” |
| Agent 内核 | 与 CLI 相同的 Claude Code（官方：Claude Code behaves the same everywhere） | 未公开。coder.qwen.ai 的问题分散提在 QwenLM/Qwen-Agent 和 QwenLM/qwen-code 两个仓库，其中一条被 qwen-code 维护方以“不属于 CLI 仓库范围”关闭，说明两者是不同产品；开源 Qwen Code 另有自己的本地 Web Shell（`qwen serve`）。两者的技术栈关系未公开 |
| 交付终点 | 分支 + PR；PR 建好后会话继续，可自动跟进 CI 失败和评审意见 | “Publish to GitHub” 生成 PR，之后有 “View PR” |
| 入口 | 浏览器、Claude App 的 Code 标签、桌面端、`claude --cloud`、定时任务、Slack | 浏览器。搜索收录的落地页带有“当前系统暂不支持、正在适配”的提示（具体指哪类系统未知） |
| 付费 | 计入 Pro/Max/Team/Enterprise 订阅额度，不单独收 VM 费用 | 未见公开定价。参考：开源 Qwen Code 的免费 OAuth 额度已于 2026-04-15 停止，用户改用阿里云 Coding Plan / Token Plan 或自带 API key |
| 已演示场景 | 修 bug、写功能、跨仓库任务、代码问答、PR 自动修复、定时任务 | Qwen3-Coder-Next 博客（2026-02）演示了在 coder.qwen.ai 上从零做一个五子棋游戏 |

## 3. 功能对比矩阵

### 3.1 入口与多端

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| 浏览器 | ✅ claude.ai/code | ✅ |
| 手机 | Claude App 的 Code 标签：起任务、看进度、回答问题、让它盯 PR | ❓（落地页有“当前系统暂不支持”提示） |
| 桌面端 | 桌面 App 里选 Cloud 环境即可起云端会话；本地会话可通过 “Open in” 发到云端 | ❓（Qwen Code 桌面 App 于 2026-08 发布，但属于本地 Agent） |
| 终端 → 云 | `claude --cloud "任务"` 从当前仓库新建云端会话；可一次发多个并行任务 | ❓ |
| 云 → 终端 | `claude --teleport` 拉回云端会话的分支和完整对话历史 | ❓ |
| 给云端会话追加消息 | `claude -p "消息" --cloud <会话ID>`，可用于 CI 脚本 | ❓ |
| IM | Claude in Slack；Claude Tag（组织共享身份的 @Claude） | ❓（Qwen Code 的 Channels 支持钉钉/企微/微信/Telegram，但驱动的是本地 Agent） |
| 深链预填 | `claude.ai/code?prompt=…&repositories=…&environment=…`，可做成 issue 系统里的按钮 | ❓ |

### 3.2 会话

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| 会话与分支 | 一个任务一个会话、一个分支；可同时跑多个 | ❓ |
| 持久性 | 关标签页继续跑；空闲时 VM 暂停并保留文件，下条消息自动恢复；VM 被回收后重开会话，对话恢复，并告诉 Agent 哪些后台任务没了 | ⚠️ 用户反馈“聊天还在，工作区没了” |
| 权限模式 | Auto（分类器审批）/ Accept edits / Plan（先出方案，批准后再改） | ❓ |
| 中断与排队 | Stop / Esc；运行中发的消息排队，可撤回；可回退到某条消息 | ⚠️ 有 Stop 按钮，有反馈点了停不下来（该 issue 归在 web-shell 范畴，是否为 coder.qwen.ai 待确认） |
| 上下文管理 | `/compact`、`/context`、`/clear`，自动压缩；子 Agent 分担上下文 | ❓ |
| 模型 | `/model`、`/effort`、`/fast` | ❓ |
| 会话管理 | 侧边栏列表、重命名、归档/恢复、删除；分享（团队版 Private/Team，个人版 Private/Public，可校验接收者的仓库权限） | ❓ |

### 3.3 代码托管、审阅与 PR

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| GitHub 连接 | GitHub App + OAuth；或在终端 `/web-setup` 复用本地 gh token | ⚠️ 有 GitHub App 和授权，但 2026-07 有“新工作区没注入认证”、2026-10 有“GitHub 侧授权成功但页面报失败” |
| 凭证安全 | 凭证不进 VM，由 GitHub 代理在服务端替换；只放行本会话的仓库；拒绝删分支、推 tag | ⚠️ 用户为绕过发布失败，把 PAT / SSH key 交给 Agent |
| 推送模型 | Agent 在每个停顿点推送到 `claude/` 前缀分支；PR 建好后继续推送即更新 PR | ⚠️ 首次发布可用，之后更新被拒或卡在 View PR；有用户反馈“每个聊天只能提交一次” |
| Diff 审阅 | 会话侧栏的 Changes 卡片（如 +42 −18）→ diff 视图；行内评论排队，随下一条消息发给 Claude；可对比任意分支 | ❓ |
| 创建 PR | Create PR / Create draft PR，自动生成标题和描述 | ✅ Publish to GitHub、View PR |
| 可追溯 | commit 带 `Claude-Session:` trailer，PR 正文带会话链接 | ❓ |
| PR 自动修复 | Auto-fix：订阅 CI 失败和评审意见；明确的直接推修复，模糊的先问用户；回复评审线程时标注由 Claude Code 生成 | ❓ |
| 多仓库 | 一个会话可选多个仓库 | ❓ |
| 其他托管平台 | GitHub Enterprise Server（Team/Enterprise）；GitLab 等可打包上传，但不能推回 | ❓ |
| 内置 GitHub 工具 | 读 issue、列 PR、取 diff、发评论；预装 gh | ⚠️ 有反馈工作区里没有 gh |

### 3.4 云端环境

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| 环境配置 | “环境”是可复用配置：网络级别 + 环境变量 + setup 脚本 + 网络密钥 | ❓ |
| 网络控制 | None / Trusted（默认，包管理器等白名单）/ Full / Custom（自定义域名，可叠加默认名单） | ❓ |
| 网络密钥 | 代理在请求离开 VM 之后再注入 key，Agent 看不到 | ❓ |
| 启动加速 | setup 脚本约 5 分钟内跑完就做文件系统快照，后续会话直接复用；改配置或约 7 天后重建 | ❓ |
| 预装工具 | Ubuntu 24.04；Python、Node 20/21/22、Ruby、PHP、Java、Go、Rust、C/C++、Docker、PostgreSQL 16、Redis 7、gh 等 | ❓ |
| 资源规格 | 约 4 vCPU、16 GB 内存、30 GB 磁盘（公开说明） | ❓ |
| 组织共享环境 | Owner 创建共享环境、指定组织默认环境 | ❓ |
| 自托管 | Self-hosted environments：会话跑在客户网络里的 runner 上，控制面仍在云端（Team/Enterprise 公测） | ❓ |

### 3.5 项目配置与扩展

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| 仓库内配置 | CLAUDE.md、`.claude/settings.json`（hooks、权限）、`.mcp.json`、rules、skills、agents、commands 随仓库生效 | ❓ |
| 连接器 | 账号上的 MCP 连接器在云端会话直接可用，流量走 Anthropic 服务器，不占沙箱出网白名单 | ❓ |
| 技能与插件 | 账号启用的 skills 自动加载；对话中可推荐插件 | ❓ |

### 3.6 编排、自动化与评审

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| Projects | 一个协调对话 + 多个并行线程；Overview 按“待审 / 等你 / 进行中 / 合并中 / 空闲 / 已解决”分组；项目指令与记忆；线程开 PR 后自动开 auto-fix（Pro/Max 公测） | ❓ |
| 定时与事件任务 | 触发器：定时（cron/一次性）、API（独立 URL + token）、GitHub 事件（PR/Issue/Release + 过滤条件）；运行历史、Run now | ❓（Qwen Code CLI 有本地 cron） |
| Code Review 服务 | GitHub App 自动审 PR：多 Agent 发现 → 验证 → 去重排序 → 行内评论 + check run；REVIEW.md 定制；Quick/Standard/Deep（Team/Enterprise） | ❓（有 qwen-code-action，可在 PR 里 @qwencoder） |
| 深度审查与安全扫描 | Ultrareview、Claude Security | ❓ |

### 3.7 产出物与协作

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| Artifacts | 会话产出发布为在线页面（看板、方案对比、PR 讲解）；版本、分享、编辑者、评论里 @claude、页面实时调用连接器 | ❓（五子棋演示说明能从零做应用，是否有在线预览未知） |
| 分享 | 会话分享 + Artifacts 分享 | ❓ |

### 3.8 安全、企业与支持

| 能力 | Claude Code 网页版 | coder.qwen.ai |
|---|---|---|
| 隔离 | 每会话独立 VM；安全代理；凭证和密钥不进沙箱 | ✅ “安全云端沙箱”（细节未公开） |
| 管理后台 | 组织开关（云会话、定时任务、Artifacts、外部分享等）、自定义角色、服务端托管设置、模型白名单、用量分析、审计日志、Compliance API、数据保留策略 | ❓ |
| 文档与支持 | 官方文档 200+ 页，另有 11 种语言译文；错误参考；状态页；每周更新日志 | ⚠️ 未见独立文档；问题分散在 Qwen-Agent 和 qwen-code 两个仓库 |

## 4. 公开反馈暴露的短板 → Claude Code 的对应设计

| 公开反馈 | 可能原因（推测） | Claude Code 的做法 | 升级动作 |
|---|---|---|---|
| “Publish to GitHub” 首次成功，之后被远端拒绝；有用户说“每个聊天只能提交一次”（[QwenLM/Qwen-Agent#783](https://github.com/QwenLM/Qwen-Agent/issues/783)，2026-02 至 04） | 发布被做成一次性导出，而不是持续同步一个分支；令牌或分支状态没跟上 | 会话 = 一个 `claude/` 分支；Agent 在每个停顿点推送；PR 建好后继续推送即更新 PR | 改成“分支即会话”的推送模型 |
| 几轮之后无法发布、卡在 View PR；Agent 在工作区里的提交宿主检测不到（[QwenLM/Qwen-Agent#1010](https://github.com/QwenLM/Qwen-Agent/issues/1010)） | 沙箱内 git 状态与控制面状态不同步 | Changes 卡片直接从推送后的 git 内容计算；事件流同步到各端 | 控制面以远端分支为唯一事实来源 |
| 聊天还在、工作区没了（[QwenLM/Qwen-Agent#783](https://github.com/QwenLM/Qwen-Agent/issues/783)） | 沙箱生命周期与对话脱钩，没有暂停/恢复 | 空闲暂停并保存文件；被回收后重开会话自动重建 VM、恢复对话，并告知哪些后台任务已丢失 | 暂停/快照/重建 + 明确提示 |
| 新工作区没注入 GitHub 认证：没有 remote、没有 token、没有 credential helper、没装 gh（[QwenLM/qwen-code#6928](https://github.com/QwenLM/qwen-code/issues/6928)，2026-07） | 凭证注入链路脆弱 | GitHub 代理：VM 里只有占位符，真实凭证在服务端替换；gh 预装 | 建 Git/代码托管代理 |
| GitHub 侧授权成功，coder.qwen.ai 仍报失败（[QwenLM/qwen-code#15476](https://github.com/QwenLM/qwen-code/issues/15476)，2026-10-24，状态 blocked） | 授权回调或状态处理 | 上手流程清晰、可跳过 App 安装；“连接后看不到仓库”有专门排障说明 | 重做授权流程和排障文案 |
| 用户把 PAT / SSH key 交给 Agent 当绕过方案（[QwenLM/Qwen-Agent#1010](https://github.com/QwenLM/Qwen-Agent/issues/1010)、[QwenLM/Qwen-Agent#783](https://github.com/QwenLM/Qwen-Agent/issues/783)） | 官方链路不可用时用户自救 | 凭证永不进沙箱；第三方 API key 用网络密钥由代理注入 | 提供安全替代，并在产品里明确不建议 |
| 关联 GitHub 后仍无法创建/添加仓库，Stop 按钮停不下 Agent（[QwenLM/qwen-code#13859](https://github.com/QwenLM/qwen-code/issues/13859)，web-shell 范畴，是否为 coder.qwen.ai 待确认） | 中断信号与流式输出共用通道 | Stop / Esc 随时中断；排队消息可撤回 | 控制通道独立于输出流 |
| coder.qwen.ai 的 SSL 证书报错被当作 CLI 仓库范围外关闭（[QwenLM/qwen-code#4611](https://github.com/QwenLM/qwen-code/issues/4611)） | 没有专门的反馈渠道 | 官方文档 + 错误参考 + 状态页 + 更新日志 | 建文档站、状态页和产品内反馈入口 |

## 5. 升级原则

1. **先稳后全**：先把“连仓库 → 起任务 → 看过程 → 审 diff → 提 PR → 迭代”做到可靠，再加新功能。
2. **统一内核**：云端沙箱里直接运行开源 Qwen Code（headless / ACP / `qwen serve`），网页、手机、桌面、终端、IDE、钉钉都是同一会话协议的客户端。这样 QWEN.md、skills、子 Agent、MCP、hooks、Plan 模式在本地和云端行为一致，也才做得了终端与云之间的会话迁移。
3. **安全默认**：凭证不进沙箱；出网默认白名单；第三方密钥由代理注入；issue 评论、Webhook 载荷等外部内容一律标记为不可信数据。
4. **由点到面**：单会话 → 并行会话 → Projects 编排 → 定时/事件自动化 → Code Review 服务。
5. **本土化 + 差异化**：国内代码托管、国内 IM、国内镜像源、阿里云账号与计费、私有化部署。

## 6. 分阶段路线图

### 6.0 总览

| 阶段 | 建议周期 | 目标 | 关键交付 | 优先级 |
|---|---|---|---|---|
| 0 止血 | 第 0–1 月 | 核心闭环可用 | 授权/发布/工作区修复；度量埋点；文档站与状态页 | P0 |
| 1 核心对齐 | 第 1–3 月 | 单会话体验对齐 Claude Code | 会话即分支；Git 代理；Diff 审阅与 PR；环境 v1；统一内核；手机网页可用 | P0 |
| 2 跨端与自动修复 | 第 3–6 月 | 任务不被设备绑定，PR 自己跟进 | Auto-fix；`qwen --cloud` / `--teleport`；远程接管本地会话；App 与推送；网络密钥；共享环境；多托管平台；预览与产出物 | P1 |
| 3 编排与自动化 | 第 6–9 月 | 从一个任务到一串任务 | Projects；定时/事件任务；Code Review 服务；钉钉/企微/飞书；账号级连接器 | P1/P2 |
| 4 企业级 | 第 9–12 月 | 能卖给企业 | 管理后台；SSO；审计与合规；自托管 runner / 专有云；用量计费 | P2 |

周期为建议值，按团队规模调整。阶段 2 的部分项目（如 Auto-fix、网络密钥）可以与阶段 1 并行。

### 6.1 阶段 0：止血与基线（第 0–1 月，P0）

目标：核心闭环可用，建立度量和反馈渠道。

- 修复 GitHub 授权回调失败、新工作区凭证未注入、多次发布失败、Stop 失效。
- 工作区生命周期：会话列表与沙箱状态保持一致；沙箱丢失时明确提示并提供“一键重建”；至少保证已推送的分支不丢。
- 埋点：会话启动成功率、环境就绪时间、首 token 时间、推送/发布成功率、授权成功率、工作区意外丢失率、中断响应时间。
- 上线状态页、产品内反馈入口、独立文档站（快速上手 + 常见问题排障）。
- 验收（建议值，按基线调整）：授权成功率 ≥ 99%；推送/发布成功率 ≥ 98%；工作区意外丢失率 < 0.5%。

### 6.2 阶段 1：核心闭环对齐（第 1–3 月，P0）

**1）会话与分支模型**

- 新建页输入框下方一排控件：环境、仓库（可多选）、分支、权限模式、模型。
- 一个任务一个会话、一个 `qwen/` 前缀分支。Agent 每到停顿点自动 commit + push。创建 PR 不结束会话，后续推送直接更新 PR。
- 侧边栏会话列表：状态、仓库、增删行数；支持搜索、重命名、归档/恢复、删除（二次确认）。
- 关闭标签页不中断任务；任务完成后会话进入空闲。

**2）代码托管集成重构**

- 两层授权：用户 OAuth（识别身份、列出仓库）+ App 安装（私有仓库访问、Webhook）。公开仓库无需安装即可读。
- Git 代理：沙箱内 git 只拿到短期、限定仓库的凭证，代理校验后替换为真实 token；只放行本会话的仓库；拒绝删分支、推 tag；`gh` 预装，`GH_TOKEN` 设为占位符，由代理注入。
- 页面内置排障提示：“看不到私有仓库 → 去安装 App / 请组织 Owner 批准”。

**3）Diff 审阅与 PR**

- 会话侧栏 Changes 卡片：显示 +N −M，点击进入 diff 视图（文件树、并排/统一视图）。
- 行内评论：在行号旁点“+”写意见；评论排队，随下一条消息一起发给 Agent，并带上“文件:行号”。
- 可选“对比分支”；Create PR / Create draft PR，自动生成标题和描述；PR 卡片显示 CI 状态。
- commit trailer 和 PR 正文附会话链接（如 `Qwen-Session: <url>`），评审者可回看整个过程。

**4）环境 v1**

- 默认环境：Trusted 网络、无变量、无脚本，开箱即用。
- 环境弹窗：网络级别（None / Trusted / Full / Custom + 允许域名）、环境变量（`.env` 格式，提示“所有使用者可见，勿放密钥”）、setup 脚本（root 执行，非 0 退出则会话启动失败）。
- Trusted 白名单同时预置国内外源：npm 与 registry.npmmirror.com、PyPI 与阿里云/清华镜像、Maven 与 maven.aliyun.com、goproxy.cn、阿里云容器镜像服务、GitHub/Gitee/Codeup 等。
- 环境缓存：setup 脚本成功后做文件系统快照，新会话从快照启动；脚本或网络配置变更、或缓存到期（如 7 天）时重建。
- 标准镜像：Ubuntu LTS + 主流语言运行时 + Docker + PostgreSQL/Redis + git/gh/jq/ripgrep；公示资源规格和超时规则。
- 空闲暂停（保存文件）→ 新消息到达自动恢复；回收后重开会话自动重建并恢复对话。

**5）统一 Agent 内核**

- 沙箱内运行 Qwen Code headless/ACP，事件经 SSE/WebSocket 推给前端；工具调用、计划、待办以卡片展示。
- 自动加载仓库内的 QWEN.md / AGENTS.md、`.qwen/settings.json`（hooks、权限）、`.mcp.json`、skills、子 Agent 定义。
- 权限模式：Plan（先出方案，批准后才改文件）、Accept edits（直接改并推送）、Auto（分类器拦截危险操作）。
- 交互：Stop / Esc 中断；运行中消息排队、可撤回；回退到某条消息；`/compact`、`/context`、`/clear`、`/model`。

**6）手机可用**

- 网页响应式适配手机（同时解决落地页“当前系统暂不支持”）。手机上至少能看进度、回答问题、审 diff、建 PR。

验收（建议值）：连接仓库的新用户 7 天内产出首个 PR 的比例；PR 合并率；有缓存时会话就绪 P95 < 30 秒。

### 6.3 阶段 2：跨端连续与自动修复（第 3–6 月，P1）

1. **PR 自动修复（Auto-fix）**：订阅 PR 的 CI 结果和评审意见（Webhook）。明确的修复直接推送；有歧义或涉及架构的先问用户；重复或无需处理的事件记录后跳过。回复评审线程时标注“由 Qwen Coder 生成”。开启前提示风险：评论可能触发 Atlantis 这类评论驱动的自动化。
2. **终端 ↔ 云**：`qwen --cloud "任务"` 从当前仓库起云端会话；`qwen --teleport` 把云端会话（分支 + 对话历史）拉回本地；`qwen -p "消息" --cloud <id>` 给云端会话追加消息。仓库没有远端时打包上传，自动排除 `.env`、密钥文件。
3. **远程接管本地会话**：Qwen Code 已有 `qwen serve` 和手机扫码接管，把它做成账号级能力，让本地会话出现在 coder.qwen.ai 的会话列表里（对标 Remote Control）。
4. **移动 App**：在 Qwen App 里加 Code 入口；推送通知覆盖任务完成、需要审批、CI 失败。
5. **网络密钥**：按域名注入 Bearer 或自定义 Header，Agent 看不到 key；保存后不可再查看，只能删除重建。
6. **组织共享环境**：管理员创建共享环境、设组织默认环境；成员只读查看配置。
7. **多代码托管**：Gitee、阿里云云效 Codeup、GitLab（含自建），接入方式与 GitHub 代理一致。
8. **预览与产出物**：
   - Web 项目在线预览：端口转发到受保护的预览域名，可分享给团队。
   - 一键部署到阿里云（差异化能力）。
   - 会话产出发布为在线页面（报告、看板、方案对比），支持版本与分享。
9. **深链预填**：`coder.qwen.ai/?prompt=…&repo=…&env=…`，便于接入 issue 系统、云效、钉钉卡片。
10. **会话分享**：私有 / 团队 / 公开；团队内分享可校验接收者的仓库访问权限。

### 6.4 阶段 3：编排与自动化（第 6–9 月，P1/P2）

1. **Projects**：
   - 一个协调对话负责拆任务、起线程、汇总结果；每个线程是独立会话、独立分支，开 PR 后自动开启 Auto-fix。
   - Overview 面板按“待审 / 等你 / 进行中 / 合并中 / 空闲 / 已解决”分组；另有 Library（输入与产出文件）、PR、定时任务标签页。
   - 项目指令与项目记忆；协调者与线程可分别配置模型和推理强度（如协调者用快模型、线程用强模型）。
2. **定时与事件任务**：
   - 触发器：定时（cron / 一次性）、API（独立 URL + 只显示一次的 token）、代码托管事件（PR / Issue / Release + 作者、分支、标签等过滤）。
   - 运行历史、Run now、暂停/恢复；每次运行都是一个可打开、可继续对话的完整会话。
   - 触发时携带的文本按不可信数据包裹后传入；按任务和账号做小时级频控。
3. **Code Review 服务**：
   - 安装 App 后按仓库配置触发时机：PR 打开时 / 每次推送 / 仅在评论 @ 时。
   - 多 Agent 发现 → 验证去误报 → 去重并按严重度排序 → 行内评论 + 汇总 + check run；评审不批准也不阻塞合并。
   - REVIEW.md 定制规则；Quick / Standard / Deep 三档，配月度预算上限。
4. **IM 集成**：钉钉、企业微信、飞书群里 @Qwen 发起云端任务，进度和结果以卡片回帖；支持组织级共享身份（对标 Claude Tag）。
5. **账号级连接器（MCP）**：在 coder.qwen.ai 账号上连接云效、语雀、钉钉文档、阿里云日志服务等，云端会话直接可用；连接器流量走服务端，不经沙箱出网。

### 6.5 阶段 4：企业级（第 9–12 月，P2）

1. **团队/企业版**：席位、角色与权限；组织开关（云端会话、定时任务、产出物外部分享、Auto-fix）；模型白名单；服务端统一下发设置（hooks、权限规则）。
2. **身份**：钉钉、阿里云 RAM、SAML/OIDC 单点登录；代码托管的组织级授权。
3. **审计与合规**：审计日志；合规 API（列出、导出、删除会话与产出物）；数据保留策略；数据驻留（国内/海外 Region）；备案与等保相关材料。
4. **自托管 runner / 专有云**：会话在客户 VPC 内执行，控制面仍在云端；可选私有化部署开源 Qwen 模型推理（Claude Code 网页版做不到的差异化）。
5. **用量与计费**：与阿里云 Token Plan 打通；按会话展示 token 与算力消耗；团队用量看板、预算上限与超额策略。

## 7. 页面与信息架构改造清单

| 页面 | 改造要点 |
|---|---|
| 全局侧边栏 | 新建会话 / 会话列表（按仓库、状态筛选）/ Projects / 定时任务 / 产出物 / 设置 |
| 首次引导 | 两步：连接代码托管（可跳过 App 安装）→ 自动创建默认环境 |
| 新建页 | 大输入框 + 控件行（环境、仓库、分支、权限模式、模型）+ 示例任务；支持 URL 预填 |
| 会话页 | 左：对话流（消息、工具调用卡片、计划/待办、提问卡片）；底：输入框（排队、撤回、斜杠命令）；右：会话侧栏（Changes、PR 状态与 Auto-fix 开关、环境信息、产出物）；标题栏菜单：重命名、分享、归档、删除、在终端打开、编辑环境 |
| Diff 页 | 文件树、并排/统一视图、行内评论、对比分支、创建 PR / 草稿 PR |
| 环境弹窗 | 网络级别与允许域名、环境变量、setup 脚本、网络密钥、共享范围 |
| 定时任务页 | 列表；详情（触发器、仓库、环境、连接器、运行历史、Run now、开关） |
| Project 页 | 协调对话 + Overview 面板（线程分组、Library、PR、定时任务） |
| 设置 | 代码托管连接、连接器、分享默认值、通知、用量与套餐 |
| 管理后台 | 成员与角色、组织开关、共享环境、模型白名单、审计日志、用量 |
| 移动端 | 会话列表、会话页、diff 审阅、推送通知 |

## 8. 技术架构要点

- **控制面**：会话服务（状态机：排队 → 准备 → 运行 → 等待输入 → 空闲/暂停 → 回收）、调度队列、事件总线、多客户端同步。
- **沙箱层**：microVM 或安全容器（可评估阿里云 Agent Sandbox / OpenSandbox）；基础镜像 + 环境快照；空闲暂停、冷热池；每会话资源配额。
- **Agent 运行时**：Qwen Code headless / ACP；会话事件流（SSE/WebSocket）；中断控制通道独立于输出流。
- **Git/代码托管代理**：短期作用域凭证、仓库白名单、危险操作拦截、全量审计。
- **出网代理**：域名白名单、网络密钥注入、限流、审计。
- **Webhook 网关**：代码托管事件 → 唤醒已有会话（Auto-fix）或新建会话（事件任务、Code Review）。
- **产出物服务**：静态页面托管（严格 CSP、独立沙箱域名）、版本、分享、评论；预览域名与访问控制。
- **通知服务**：站内、App 推送、钉钉/企微/飞书。
- **计量计费**：token + 沙箱分钟数；配额、并发上限与频控。

## 9. 指标体系

- **北极星**：每周被合并的 Qwen Coder PR 数（或“被采纳的代码变更数”）。
- **漏斗**：注册 → 连接代码托管 → 首个会话 → 首个 diff → 首个 PR → 首个合并。
- **可靠性**：会话启动成功率、环境就绪时间（冷/热）、首 token 时间、推送/发布成功率、授权成功率、工作区意外丢失率、中断响应时间。
- **质量**：PR 合并率、首次推送 CI 通过率、Auto-fix 成功率、评审意见一次解决率、回滚率。
- **使用深度**：人均并行会话数、移动端占比、`--cloud` / `--teleport` 使用率、定时任务数、Projects 线程数。
- **留存与成本**：D7/D30 留存、每个合并 PR 的 token 与算力成本。

## 10. 风险与对策

| 风险 | 对策 |
|---|---|
| 国内访问 GitHub 不稳定 | 多托管平台（Gitee / 云效 / GitLab）+ 海外出口代理 + 国内镜像源 |
| 沙箱成本高 | 空闲暂停、快照缓存、冷热池、按套餐限制并发 |
| 安全：提示注入、密钥外泄、越权推送 | 凭证不进沙箱、出网白名单、外部内容标记为不可信、推送限制、审计 |
| 长程任务完成率不够 | Plan 模式、让 Agent 自己跑测试验证、子 Agent、模型路由（强模型规划、快模型执行） |
| Auto-fix 回评论误触发评论驱动的自动化 | 默认关闭，按仓库开启并提示风险 |
| 与开源 Qwen Code 分叉 | 云端直接复用开源内核；云端独有能力（代理、环境、编排）放在控制面 |

## 11. 差异化机会

- **开放权重模型**：企业可在专有云或本地推理，满足数据不出域。Claude Code 网页版做不到。
- **国内生态一条龙**：云效（代码与流水线）+ 钉钉（协作）+ 阿里云（部署）。
- **预览与部署**：Qwen Chat 已有 Web Dev 能力。Claude Code 网页版目前以 PR 为交付终点，产出展示靠无后端的 Artifacts 页面；coder.qwen.ai 可以做到“改完即预览、一键上线”。
- **价格**：用 Token Plan 打包，降低重度使用门槛。
- **多 Agent 协作**：Qwen Code 已支持把任务交给 Claude Code / Codex，云端可以做成多模型编排。

## 12. 实测核对清单

1. 新用户从登录到第一个 PR 需要几步、多长时间？
2. 同一会话连续修改 3 次，PR 是否都能更新？
3. 关闭标签页 30 分钟后回来，工作区和对话是否完整？
4. 能否同时运行 3 个任务？
5. 在沙箱里执行 `git remote -v`、`gh auth status`、`env | grep -i token`，输出是什么？（判断凭证是否进了沙箱）
6. 能否访问任意外网域名？有没有出网控制？
7. 能否配置环境变量和 setup 脚本？第二次启动是否更快？
8. 仓库里的 QWEN.md / AGENTS.md 是否生效？
9. 手机浏览器能否正常使用？
10. 能否在 diff 上行内评论？PR 的 CI 失败后能否自动修复？
11. 使用哪个模型、能否切换？额度与计费规则是什么？
12. 能否接入 Gitee、云效或 GitLab 仓库？

## 13. 资料来源

Claude Code 网页版（官方文档）：

- [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Get started with Claude Code in the cloud](https://code.claude.com/docs/en/web-quickstart)
- [Configure cloud environments](https://code.claude.com/docs/en/cloud-environments)
- [Projects](https://code.claude.com/docs/en/claude-projects)
- [Scheduled tasks](https://code.claude.com/docs/en/routines)
- [Claude Code on mobile](https://code.claude.com/docs/en/mobile)
- [Remote Control](https://code.claude.com/docs/en/remote-control)
- [Code Review](https://code.claude.com/docs/en/code-review)
- [Artifacts](https://code.claude.com/docs/en/artifacts)
- [Self-hosted environments](https://code.claude.com/docs/en/self-hosted-environments)

coder.qwen.ai 与 Qwen 生态（公开资料）：

- [coder.qwen.ai 落地页（搜索引擎收录的描述）](https://coder.qwen.ai/)
- [Qwen3-Coder-Next 博客（含 coder.qwen.ai 演示）](https://qwen.ai/blog?id=qwen3-coder-next)
- [QwenLM/Qwen-Agent#783：Publish to GitHub 失败](https://github.com/QwenLM/Qwen-Agent/issues/783)
- [QwenLM/Qwen-Agent#1010：几轮后失去发布能力](https://github.com/QwenLM/Qwen-Agent/issues/1010)
- [QwenLM/qwen-code#6928：新工作区未注入 GitHub App 认证](https://github.com/QwenLM/qwen-code/issues/6928)
- [QwenLM/qwen-code#15476：coder.qwen.ai 的 GitHub 授权报失败](https://github.com/QwenLM/qwen-code/issues/15476)
- [QwenLM/qwen-code#13859：GitHub 集成与 Stop 按钮](https://github.com/QwenLM/qwen-code/issues/13859)
- [QwenLM/qwen-code#4611：coder.qwen.ai SSL 证书错误](https://github.com/QwenLM/qwen-code/issues/4611)
- [Qwen Code 仓库](https://github.com/QwenLM/qwen-code)
- [Qwen Code daemon 模式（qwen serve）](https://qwenlm.github.io/qwen-code-docs/en/users/qwen-serve/)
- [Qwen Code 每周更新](https://qwenlm.github.io/qwen-code-docs/en/blog/updates/)
- [qwen-code-action（GitHub Action）](https://qwenlm.github.io/qwen-code-docs/en/users/integration-github-action/)
