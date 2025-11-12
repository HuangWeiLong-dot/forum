import React from 'react'
import './Terms.css'

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1 className="terms-title">用户协议</h1>
        <div className="terms-content">
          <p className="terms-updated">最后更新：2025年</p>

          <section className="terms-section">
            <h2>1. 接受协议</h2>
            <p>
              欢迎使用 REForum 论坛平台。通过访问和使用本平台，您同意遵守本用户协议的所有条款和条件。
              如果您不同意本协议的任何部分，请不要使用本平台。
            </p>
          </section>

          <section className="terms-section">
            <h2>2. 账户注册</h2>
            <p>
              2.1 您需要注册账户才能使用本平台的某些功能。注册时，您需要提供真实、准确、完整的信息。
            </p>
            <p>
              2.2 您有责任维护账户信息的安全性和准确性。您不得与他人分享您的账户信息。
            </p>
            <p>
              2.3 您对使用您的账户进行的所有活动负责。
            </p>
          </section>

          <section className="terms-section">
            <h2>3. 用户行为规范</h2>
            <p>在使用本平台时，您同意：</p>
            <ul>
              <li>遵守所有适用的法律法规</li>
              <li>尊重其他用户，不发布侮辱、诽谤、威胁或骚扰性内容</li>
              <li>不发布违法、色情、暴力或其他不当内容</li>
              <li>不进行垃圾邮件、广告或其他商业推广活动</li>
              <li>不侵犯他人的知识产权或其他权利</li>
              <li>不尝试破坏、干扰或损害平台的安全性和功能</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. 内容发布</h2>
            <p>
              4.1 您对您在本平台上发布的所有内容负责。
            </p>
            <p>
              4.2 您保留对您发布内容的所有权利，但通过发布内容，您授予本平台使用、展示和分发这些内容的非独占许可。
            </p>
            <p>
              4.3 本平台保留删除任何违反本协议或相关法律法规的内容的权利。
            </p>
          </section>

          <section className="terms-section">
            <h2>5. 知识产权</h2>
            <p>
              本平台的所有内容，包括但不限于文本、图形、标识、图标、图像、音频、视频、软件等，均受知识产权法保护。
              未经授权，您不得复制、修改、分发或使用这些内容。
            </p>
          </section>

          <section className="terms-section">
            <h2>6. 免责声明</h2>
            <p>
              6.1 本平台按"现状"提供，不提供任何明示或暗示的保证。
            </p>
            <p>
              6.2 本平台不对用户发布的内容的准确性、完整性或可靠性负责。
            </p>
            <p>
              6.3 本平台不对因使用或无法使用本平台而造成的任何直接或间接损失负责。
            </p>
          </section>

          <section className="terms-section">
            <h2>7. 服务变更和终止</h2>
            <p>
              7.1 本平台保留随时修改、暂停或终止服务的权利，无需事先通知。
            </p>
            <p>
              7.2 如果您违反本协议，本平台有权立即终止您的账户和访问权限。
            </p>
          </section>

          <section className="terms-section">
            <h2>8. 协议修改</h2>
            <p>
              本平台保留随时修改本协议的权利。修改后的协议将在平台上公布。
              继续使用本平台即表示您接受修改后的协议。
            </p>
          </section>

          <section className="terms-section">
            <h2>9. 联系我们</h2>
            <p>
              如果您对本协议有任何疑问，请通过 <a href="/contact">联系我们</a> 页面与我们取得联系。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Terms

