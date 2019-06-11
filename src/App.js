import React, { Component } from "react";
import Particles from "react-particles-js"; //This is related with the animated background
import Clarifai from "clarifai"; //This is related with the API
import Navigation from "./components/Navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import "./App.css";

//This is related with the IA App, face detection. Is the API key to access
const app = new Clarifai.App({
  apiKey: "0c081cda46a448468c6c184c146747c5"
});

//Bellow are the STATE that will change with the code
class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: "signin",
      isSignedIn: false,
      user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: ""
      }
    };
  }

  //This is a function, from where we retrieve in Register & Signin the user details
  //...as a response back from our API (NodeJS) 
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  //calculateFaceLocation() is to get the data about face location
  //And we do the calculations to get the location for the face <div>
  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    //Bellow 2 lines is to get the first famous person
    const person = data.outputs[0].data.regions[0].data.concepts[0].name;
    const probability = data.outputs[0].data.regions[0].data.concepts[0].value;
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
      person: person,
      probability: `${Math.floor(probability * 100)} %`
    };
  };

  //This is to store the cordinates of the FaceBox
  displayFaceBox = box => {
    this.setState({ box: box });
  };

  //This is to get the link
  onInputChange = event => {
    this.setState({ input: event.target.value });
  };


  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
      .predict("e466caa0619f444ab97497640cefc4dc", this.state.input)
      //calculateFaceLocation() is to get the data about face location
      //displayFaceBox() is to pass the returned values to state.box
      //The values from state.box are useful to create the div in "FaceRecgnition.js"
      //On the 'fetch' bellow we are calculating the number of entries
      //We send to API user.id, API will do entries++ and return the total count of entries
      .then(response => {
        if (response) {
          fetch("http://localhost:3000/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
    
            });
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(err => console.log(err));
  };

  //This is to handle the Routes if is SignedIn, or Out. However is on the server side that we will handle authentication.
  onRouteChange = route => {
    if (route === "signout") {
      this.setState({ isSignedIn: false });
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    //Line bellow is to avoid that we write all the time "this.state.isSignedIn" for example
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles
          className="particles"
          params={{
            particles: {
              number: {
                value: 60,
                density: {
                  enable: true,
                  value_area: 800
                }
              }
            }
          }}
        />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />

        {/* The default route is signin, in state above, however if we click on signin 
        it will route us to 'home' and render the other Components after -> : <- */}
        {route === "home" ? (
          <div>
            <Logo />
            {/* We need to send the details bellow to RANK, so that can display 
            the name and the number of entries */}
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />

            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />

            <FaceRecognition box={box} imageUrl={imageUrl} />
    
          </div>
        ) : route === "signin" ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
