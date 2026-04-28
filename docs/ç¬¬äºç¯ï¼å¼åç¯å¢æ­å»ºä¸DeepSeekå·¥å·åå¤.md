# 开发环境搭建与DeepSeek工具准备 🛠️

> 为AI辅助CAD开发做好充分准备 🚀

---

## 一、环境准备概览 📋

在开始AutoCAD C#二次开发之前，我们需要准备以下软件和工具：

| 软件/工具 | 推荐版本 | 说明 |
| :--- | :--- | :--- |
| AutoCAD | 2020-2024 | 支持.NET API的版本 |
| Visual Studio | 2019/2022 | 专业版或社区版均可 |
| .NET Framework | 4.7.2-4.8 | 根据AutoCAD版本选择 |
| ObjectARX SDK | 对应AutoCAD版本 | 可选，提供更多开发资源 |

### AutoCAD版本与.NET Framework对应关系

选择正确的.NET Framework版本非常重要，不同版本的AutoCAD对.NET Framework有不同的要求：

| AutoCAD版本 | .NET Framework版本 | Visual Studio版本 |
| :--- | :--- | :--- |
| AutoCAD 2018 | 4.6 | VS2015/VS2017 |
| AutoCAD 2019 | 4.7 | VS2017/VS2019 |
| AutoCAD 2020 | 4.7 | VS2017/VS2019 |
| AutoCAD 2021 | 4.8 | VS2019 |
| AutoCAD 2022 | 4.8 | VS2019/VS2022 |
| AutoCAD 2023 | 4.8 | VS2019/VS2022 |
| AutoCAD 2024 | 4.8 | VS2022 |

---

## 二、Visual Studio安装与配置 🖥️

### 1. 下载Visual Studio

Visual Studio是开发AutoCAD .NET插件的首选IDE。访问[Visual Studio官网](https://visualstudio.microsoft.com/zh-hans/downloads/)下载适合的版本：

- **Visual Studio Community**：免费，适合个人开发者
- **Visual Studio Professional**：付费，适合专业团队
- **Visual Studio Enterprise**：付费，功能最全

下面是软件的下载连接，也可以直接从这里下载（整合好，破解版的）：

📦 [AutoCAD 2024下载连接](https://pan.baidu.com/s/1Pin1krQJHaQUuky2fpMNGw?pwd=2sq7)

📦 [Visual Studio 2022下载连接](https://pan.baidu.com/s/1fRTH673-Kmw0gK_EAfM9bw?pwd=aasq)

### 2. 安装工作负载

安装时，务必选择以下工作负载：

**1️⃣ .NET桌面开发**：包含C#开发所需的所有组件
   - .NET Framework 4.8开发工具
   - C#和Visual Basic Roslyn编译器
   - .NET Profiling工具

**2️⃣ 可选组件**：
   - 代码版本管理工具
   - Git [下载地址](https://git-scm.cn/install/windows)

![[file-20260319134621820.png]]

> 💡 **提示**：安装时无脑点击下一步即可。后续介绍怎么使用。（强烈建议安装Git，因为AI写出来的代码部分理解有问题导致代码找不到等问题，代码版本控制超级好用）

---

## 三、创建AutoCAD插件项目 📁

### 1. 创建新项目

打开Visual Studio，按以下步骤创建项目：

**步骤1**：选择"创建新项目"

![[file-20260319134321847.png]]

**步骤2**：搜索"类库"，选择"类库"（如果CAD版本低的话建议使用".NET Framework类库"、强烈建议使用下图所示类库）

**步骤3**：点击"下一步"

![[file-20260319134237645.png]]

### 2. 配置项目属性

在项目配置页面：

```
项目名称：MyAutoCADPlugin
位置：选择合适的文件夹
解决方案名称：MyAutoCADPlugin（与项目名相同）
框架：.NET Framework 4.8（根据AutoCAD版本选择）
```

![[file-20260319134904399.png]]

选择类库点击下一步，是这个界面，选择.net8.0即可。

![[file-20260319135021985.png]]

### 3. 修改项目属性

**首先双击点击项目名称，打开全局设置**

![[file-20260319142733446.png]]

**将版本改为net48**

![[file-20260319142819716.png]]

![[file-20260319142852610.png]]

> ⚠️ **注意**：一定要修改这个，不过也可以用8.0，建议新手还是使用net48版本的。

**将这个选项改为disable**

这是因为8.0和48版本不一致，一定要改，否则后续会报错。

![[file-20260319144304211.png]]

**右键项目 → 属性，进行以下配置：**

![[file-20260319135645040.png]]

#### 生成选项卡配置

- **平台目标**：x64（重要！AutoCAD是64位程序）

![[file-20260319135745801.png]]

#### 调试选项卡配置

- **启动外部程序**：选择AutoCAD的acad.exe路径
  例如：`C:\Program Files\Autodesk\AutoCAD 2022\acad.exe`（根据CAD安装的路径进行设置）

![[file-20260319140053562.png]]

![[file-20260319140140729.png]]

点击浏览，找到CAD安装目录下的exe文件，就可以进行调试了。

![[file-20260319140200817.png]]

### 4. 添加AutoCAD引用

#### 核心DLL文件说明

AutoCAD .NET API由以下核心DLL组成：

| DLL文件 | 说明 | 是否必需 |
| :--- | :--- | :--- |
| acdbmgd.dll | 数据库相关API | 必需 |
| acmgd.dll | 应用程序相关API | 必需 |
| accoremgd.dll | 核心API | 必需 |
| AcMgdExtensions.dll | 扩展API | 可选 |
| AcWindows.dll | 窗口相关API | 可选 |

#### 添加引用步骤

**方法一：传统方式**

1. 在解决方案资源管理器中，右键"引用"
2. 选择"添加引用"
3. 点击"浏览"按钮
4. 导航到AutoCAD安装目录
   - 默认路径：`C:\Program Files\Autodesk\AutoCAD 2022\`
5. 选择以下DLL文件：
   - `acdbmgd.dll`
   - `acmgd.dll`
   - `accoremgd.dll`
6. 点击"添加"，然后点击"确定"

**方法二：直接添加依赖项**

或者直接右键依赖项，点击添加项目引用：

![[file-20260319140447786.png]]

点击浏览，找到CAD的安装目录，然后找到这几个文件，进行勾选即可。

![[file-20260319140541502.png]]

#### 设置引用属性

添加引用后，建议设置以下属性：

选中每个引用，在属性窗口中：
- **复制本地**：False（避免DLL冲突）
- **嵌入互操作类型**：False

在程序集中可以看见三个引用的程序，选中后右键属性。

![[file-20260319140638998.png]]

复制本地改为否。

![[file-20260319140736103.png]]

#### 添加常用using语句

在代码文件顶部添加以下using语句：

```csharp
using Autodesk.AutoCAD.ApplicationServices;
using Autodesk.AutoCAD.DatabaseServices;
using Autodesk.AutoCAD.EditorInput;
using Autodesk.AutoCAD.Geometry;
using Autodesk.AutoCAD.Runtime;
```

---

## 四、配置调试环境 🔧

### 1. 设置启动项目

1. 右键解决方案 → 属性
2. 选择"启动项目"
3. 选择"单启动项目"
4. 选择你的插件项目

### 2. 配置调试命令

在项目属性的"调试"选项卡中：

**启动**：选择"启动外部程序"

**路径**：`C:\Program Files\Autodesk\AutoCAD 2022\acad.exe`

**命令行参数**（可选）：
```
/nologo /nossm
```

- `/nologo`：启动时不显示Logo
- `/nossm`：不显示开始屏幕

### 3. 设置工作目录

工作目录设置为AutoCAD安装目录：
```
C:\Program Files\Autodesk\AutoCAD 2022\
```

---

## 五、注册和配置DeepSeek等AI工具 🤖

### 1. 注册DeepSeek账号

> 💡 建议直接DeepSeek官网使用，或者可以使用Trae、Claude等

1. 访问[DeepSeek官网](https://www.deepseek.com/)
2. 点击"注册"按钮
3. 按照提示完成注册流程
4. 登录账号，进入控制台

### 2. 安装GitHub Copilot插件（可选）

GitHub Copilot是一个强大的AI代码助手，可以直接集成到Visual Studio中：

1. 打开Visual Studio
2. 点击"扩展" -> "管理扩展"
3. 在搜索框中输入"GitHub Copilot"
4. 点击"下载"并安装
5. 重启Visual Studio
6. 按照提示登录GitHub账号并授权

### 3. 配置其他AI工具（可选）

| AI工具 | 官网地址 | 特点 |
| :--- | :--- | :--- |
| ChatGPT | [OpenAI官网](https://openai.com/) | 对话式交互，解释能力强 |
| Claude | [Anthropic官网](https://www.anthropic.com/) | 长文本处理能力强 |
| CodeWhisperer | [AWS官网](https://aws.amazon.com/codewhisperer/) | 实时代码建议 |

---

## 六、如何向DeepSeek提问：编写清晰的提示词 💬

要让DeepSeek生成高质量的代码，编写清晰的提示词非常重要。

### 1. 提示词结构

一个好的提示词应该包含以下部分：

- **背景信息**：说明这是AutoCAD .NET开发，使用C#语言
- **具体需求**：详细描述你想要实现的功能
- **输入输出**：说明输入参数和期望的输出结果
- **特殊要求**：如代码风格、命名规范等

### 2. 示例提示词

❌ **不好的提示词**：
> "帮我写一个绘制圆的代码"

✅ **好的提示词**：
> "请生成一个AutoCAD C#插件函数，用于在用户指定的位置创建一个指定半径的圆。函数应该：
> 1. 提示用户输入圆心位置
> 2. 提示用户输入圆的半径
> 3. 使用事务处理确保操作的原子性
> 4. 在命令行输出成功信息
> 5. 处理用户取消操作的情况"

### 3. 进阶提示词技巧

- 📝 **分步骤提问**：对于复杂功能，分多个步骤向DeepSeek提问
- 📋 **提供示例代码**：如果有现有代码，可以提供给DeepSeek作为参考
- ⚠️ **明确错误信息**：如果遇到错误，提供完整的错误信息
- 💡 **要求解释**：如果需要DeepSeek解释代码，可以明确要求

---

## 七、第一个DeepSeek辅助任务：生成"Hello World"命令代码 🌟

现在，让我们使用DeepSeek生成第一个AutoCAD插件命令。

### 1. 向DeepSeek提问

> "请生成一个AutoCAD C#插件的Hello World命令代码。要求：
> 1. 创建一个名为HelloWorld的命令
> 2. 当命令执行时，在命令行输出"Hello, AutoCAD!"
> 3. 显示一个消息框，显示"Hello, AutoCAD! Welcome to C# development."
> 4. 包含必要的using语句和命名空间"

### 2. DeepSeek生成的代码

```csharp
using System;
using System.Windows.Forms;
using Autodesk.AutoCAD.ApplicationServices;
using Autodesk.AutoCAD.EditorInput;
using Autodesk.AutoCAD.Runtime;

namespace AutoCADPluginHelloWorld
{
    /// <summary>
    /// AutoCAD C# 插件 Hello World 示例
    /// 包含一个名为 HelloWorld 的命令，该命令在命令行输出信息并显示消息框。
    /// </summary>
    public class HelloWorldCommands
    {
        /// <summary>
        /// HelloWorld 命令的实现。
        /// 在命令行输出 "Hello, AutoCAD!" 并显示一个消息框。
        /// </summary>
        [CommandMethod("HelloWorld")]
        public void HelloWorld()
        {
            // 获取当前 AutoCAD 应用程序和文档
            Document doc = Application.DocumentManager.MdiActiveDocument;
            if (doc == null)
            {
                // 如果没有活动文档，则无法输出到命令行，但仍可尝试显示消息框
                MessageBox.Show("没有活动的 AutoCAD 文档。", "HelloWorld 错误");
                return;
            }

            Editor ed = doc.Editor;

            // 在命令行输出 Hello, AutoCAD!
            ed.WriteMessage("\nHello, AutoCAD!");

            // 显示消息框
            string message = "Hello, AutoCAD! Welcome to C# development.";
            string title = "HelloWorld Command";
            MessageBox.Show(message, title, MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }
}
```

可以看到提示报错了，没关系这个是很正常的报错，是没有引用程序集。新手如果不懂可以将这个报错复制，发给DeepSeek，他会帮你解释怎么去解决。

![[file-20260319141828538.png]]

可以看到给出了两个解决方法：

![[file-20260319142014553.png]]

还是点击依赖项右键点击添加项目引用即可。点击程序集，搜索System.Windows.Forms，点击添加即可。

> ⚠️ **注意**：这里需要注意，一定是全局设置.net48才可以，如果是.net8.0，可以直接修改全局文件即可，如果不会可以问DeepSeek。

![[file-20260319143029647.png]]

![[file-20260319143120066.png]]

可以看到还是有问题，继续发给AI。

第一个报错是编译器没有办法确认Application是哪个的，可以直接鼠标放到这个位置。

第二个报错的问题是：

![[file-20260319144047781.png]]

![[file-20260319143728386.png]]

选择这一个，就可以了：

![[file-20260319143818448.png]]

这样就可以了，没有报错了。

![[file-20260319144446888.png]]

点击生成，进行编译。

### 3. 编译与加载插件

#### 编译项目

按 `Ctrl+Shift+B` 编译项目，确保没有错误。

点击配置文件1，之前设置好的，直接运行，自动启动CAD。

![[file-20260319144649143.png]]

#### 加载插件

**方法一：使用NETLOAD命令**

1. 在AutoCAD命令行输入 `NETLOAD`
2. 浏览到编译生成的DLL文件（可以点击项目文件右键点击，找到这个文件目录）
3. 点击"打开"

![[file-20260319144931844.png]]

![[file-20260319145019267.png]]

![[file-20260319145028548.png]]

可以看到这个文件就是文件名称的dll文件，就是写的程序，接下来进入到CAD中找到这个目录的路径，然后进行加载这个dll文件就成功了。

![[file-20260319145122346.png]]

进行寻找路径加载：

![[file-20260319144854831.png]]

![[file-20260319145336549.png]]

然后输入 `HelloWorld`，就可以看到代码已经编译成功，测试成功。

![[file-20260319145420152.png]]

🎉 **恭喜你，已经学会怎么编写程序以及测试程序了！**

**方法二：自动加载（推荐）**

自动加载方法很多，本文介绍一个简单的适用的自动加载方法：

1. 首先创建一个txt文件
2. 写入下方的代码，将代码后面的路径改为编译好的dll文件的路径即可
3. 保存后，将文件的后缀名称改为.lsp即可
4. 进入CAD中输入 `appload`，点击内容，找到这个lsp文件就可以自动加载了

创建一个lsp文件，内容如下：

```lisp
(command "NETLOAD" "C:/Path/To/Your/MyAutoCADPlugin.dll")
```

将此文件放到AutoCAD的启动组中。

---

## 八、常见问题与解决方案 ❓

### 1. 无法找到AutoCAD DLL文件

**问题**：在添加引用时找不到acdbmgd.dll等文件。

**解决方案**：
- ✅ 确认AutoCAD安装路径正确
- ✅ 确保安装了完整版本的AutoCAD
- ✅ 检查文件权限是否正确

### 2. 编译错误：找不到类型或命名空间

**问题**：编译时出现"类型或命名空间不存在"错误。

**解决方案**：
1. 检查是否添加了acdbmgd.dll和acmgd.dll引用
2. 确保using语句正确
3. 检查引用的"复制本地"属性是否为False

### 3. 加载错误：无法加载程序集

**问题**：在AutoCAD中使用NETLOAD命令加载插件时失败。

**解决方案**：
1. 确认.NET Framework版本与AutoCAD兼容
2. 确保项目平台目标为x64
3. 取消勾选"首选32位"
4. 检查是否缺少依赖项

### 4. 调试错误：无法启动调试

**问题**：无法启动调试。

**解决方案**：
1. 检查启动外部程序路径是否正确
2. 确保AutoCAD已正确安装
3. 以管理员身份运行Visual Studio

### 5. 命令无法识别

**问题**：插件加载后命令无法识别。

**解决方案**：
1. 使用NETLOAD重新加载插件
2. 检查CommandMethod属性中的命令名称
3. 确保类是public的

---

## 九、进阶配置 ⚙️

### 1. 配置代码片段

创建常用代码片段，提高开发效率：

在Visual Studio中：
1. 工具 → 代码片段管理器
2. 选择"C#"语言
3. 添加自定义代码片段文件夹

### 2. 配置调试符号

为了更好地调试，建议配置：
- 生成调试信息：完整
- 优化代码：关闭（调试时）

### 3. 配置版本控制

使用Git进行版本控制：
1. 创建.gitignore文件，排除：
   - bin/和obj/文件夹
   - 用户设置文件
   - DLL引用

---

## 十、总结 🎉

通过本文的学习，你已经成功搭建了AutoCAD .NET开发环境，并配置了DeepSeek等AI工具。关键要点回顾：

| 要点 | 说明 |
| :--- | :--- |
| 🔧 版本匹配 | 确保.NET Framework版本与AutoCAD版本兼容 |
| 💻 平台目标 | 必须设置为x64 |
| 📦 引用配置 | 正确添加并配置DLL引用 |
| 🐛 调试设置 | 配置启动程序以便直接调试 |
| 💬 提示词技巧 | 编写清晰的提示词以获得高质量代码 |

现在你可以开始使用DeepSeek辅助开发AutoCAD插件了。在接下来的教程中，我们将学习如何使用DeepSeek辅助理解AutoCAD .NET API，这将帮助你更深入地掌握CAD开发的核心概念。

---

**下一篇预告**：DeepSeek辅助理解AutoCAD .NET API 📚

---

**关注我们的公众号**，每天学习一篇关于DeepSeek辅助CAD二次开发的教程，让我们一起开启智能设计的新时代！ 🌟
