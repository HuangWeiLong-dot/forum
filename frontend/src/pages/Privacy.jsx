import React from 'react'
import './Privacy.css'

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1 className="privacy-title">隐私政策</h1>
        <div className="privacy-content">
          <p className="privacy-updated">最后更新：2025年</p>

          <section className="privacy-section">
            <h2>1. 信息收集</h2>
            <p>
              我们收集以下类型的信息：
            </p>
            <ul>
              <li><strong>账户信息</strong>：用户名、邮箱地址、密码（加密存储）</li>
              <li><strong>个人资料</strong>：头像、个人简介等可选信息</li>
              <li><strong>使用数据</strong>：您发布的帖子、评论、浏览记录等</li>
              <li><strong>技术信息</strong>：IP地址、浏览器类型、设备信息等</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>2. 信息使用</h2>
            <p>我们使用收集的信息用于：</p>
            <ul>
              <li>提供和维护平台服务</li>
              <li>处理您的注册和账户管理</li>
              <li>改善用户体验和平台功能</li>
              <li>发送重要通知和更新</li>
              <li>防止欺诈和滥用行为</li>
              <li>遵守法律法规要求</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. 信息共享</h2>
            <p>
              3.1 我们不会向第三方出售、交易或出租您的个人信息。
            </p>
            <p>
              3.2 我们可能在以下情况下共享您的信息：
            </p>
            <ul>
              <li>获得您的明确同意</li>
              <li>遵守法律法规或法律程序</li>
              <li>保护我们的权利和财产</li>
              <li>与服务提供商共享（如邮件服务），但仅限于提供服务所需</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. 数据安全</h2>
            <p>
              4.1 我们采用合理的技术和管理措施保护您的个人信息安全。
            </p>
            <p>
              4.2 您的密码经过加密存储，我们无法直接查看您的原始密码。
            </p>
            <p>
              4.3 尽管我们采取了安全措施，但请注意互联网传输并非100%安全，我们无法保证绝对安全。
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Cookie 和跟踪技术</h2>
            <p>
              我们使用 Cookie 和类似技术来：
            </p>
            <ul>
              <li>记住您的登录状态</li>
              <li>保存您的偏好设置</li>
              <li>分析平台使用情况</li>
              <li>改善服务质量</li>
            </ul>
            <p>
              您可以通过浏览器设置管理 Cookie，但这可能影响某些功能的正常使用。
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. 您的权利</h2>
            <p>您对自己的个人信息享有以下权利：</p>
            <ul>
              <li><strong>访问权</strong>：查看我们持有的您的个人信息</li>
              <li><strong>更正权</strong>：更正不准确或不完整的信息</li>
              <li><strong>删除权</strong>：请求删除您的个人信息</li>
              <li><strong>撤回同意</strong>：撤回您对信息处理的同意</li>
            </ul>
            <p>
              如需行使这些权利，请通过 <a href="/contact">联系我们</a> 页面与我们联系。
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. 数据保留</h2>
            <p>
              我们会在您使用服务期间保留您的个人信息，并在您删除账户后合理时间内保留，
              以遵守法律义务、解决争议和执行我们的协议。
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. 儿童隐私</h2>
            <p>
              我们的服务面向18岁及以上的用户。我们不会故意收集儿童的个人信息。
              如果您是儿童的父母或监护人，发现我们收集了儿童信息，请立即联系我们。
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. 政策更新</h2>
            <p>
              我们可能会不时更新本隐私政策。更新后的政策将在平台上公布，并更新"最后更新"日期。
              继续使用本平台即表示您接受更新后的政策。
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. 联系我们</h2>
            <p>
              如果您对本隐私政策有任何疑问或担忧，请通过 <a href="/contact">联系我们</a> 页面与我们取得联系。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Privacy

