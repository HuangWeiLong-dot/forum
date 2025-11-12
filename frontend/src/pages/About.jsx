import React from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import './About.css'

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <FaInfoCircle className="about-icon" />
          <h1>关于我们</h1>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>欢迎来到 REForum</h2>
            <p>
              REForum 是一个现代化的社区论坛平台，致力于为用户提供优质的交流体验。
              我们相信每个人都有独特的观点和想法值得分享，REForum 就是这样一个让思想碰撞、
              让知识传播的平台。
            </p>
          </section>

          <section className="about-section">
            <h2>初衷</h2>
            <p>
              构建一个开放、友好、有价值的社区平台，让每个人都能在这里找到归属感，
              分享知识，结交朋友，共同成长。
            </p>
          </section>

          <section className="about-section">
            <h2>加入我们</h2>
            <p>
              如果你有任何建议、问题或想要参与社区建设，欢迎通过以下方式与我们取得联系。
            </p>
            <div className="contact-button-container">
              <a href="/contact" className="contact-button">联系我们</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default About

