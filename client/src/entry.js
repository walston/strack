import React from 'react'
import ReactDom from 'react-dom'

const Nav = () => (
  <nav className="navbar">
    <ul className="navbar-nav">
      <li>Hello</li>
      <li>Hi</li>
    </ul>
  </nav>
)

ReactDom.render(
  <Nav/>,
  document.getElementById('ReactApp')
)
