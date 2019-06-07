import React from 'react'


const Navigation = ({ onRouteChange, isSignedIn }) => {
        if (isSignedIn) {
            return (
            <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
                {/* bellow is: () => onRouteChange('signout') and is because we want to execute function only when we click */}
                {/* It will render only the modules based on the route in App.js */}
                <p onClick={() => onRouteChange('signout')} className='f3 link dim black underline pa3 pointer '> Sign Out </p>
            </nav>
            )
        } else {
            return (
            <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
                <p onClick={() => onRouteChange('signin')} className='f3 link dim black underline pa3 pointer '> Sign In </p>
                <p onClick={() => onRouteChange('register')} className='f3 link dim black underline pa3 pointer '> Register </p>
            </nav>
            )
        }
}


export default Navigation;