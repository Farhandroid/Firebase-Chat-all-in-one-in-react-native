import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableHighlight,
  Image,
  Alert,
} from 'react-native';
import firebase from 'firebase';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.init();
    state = {
      fullName: '',
      userId:''
    };
    this.setUserId = this.setUserId.bind(this);
  }

  init = () => {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyB9jDwkJKV2L2pka0o9FAzYoa4TiFNsU2s',
        authDomain: 'testchatting-6a960.firebaseapp.com',
        databaseURL: 'https://testchatting-6a960.firebaseio.com',
        projectId: 'testchatting-6a960',
        storageBucket: 'testchatting-6a960.appspot.com',
        messagingSenderId: '362438143885',
        appId: '1:362438143885:web:12874454c98ba8cebe57c4',
        measurementId: 'G-ZWGY1VF0H3',
      });
    }
  };

  startChatListScreen() {
    this.saveDataInAsyncStorage();
    this.props.navigation.navigate('ShowAllConnectedUser', {
      firebaseInstance: this.firebase,
      userName:this.state.fullName,
    });
  
  }

  saveDataInAsyncStorage = async () => {

    console.log("fullName loginScreen : "+this.state.fullName);
    console.log("userId loginScreen : "+this.state.userId);
    try {
      await AsyncStorage.setItem('@storage_username', this.state.fullName);
      await AsyncStorage.setItem('@storage_userId', this.state.userId.toString());
    } catch (e) {
      Alert.alert("Error in loginScreen : "+e.toString());
    }
  };

  getRandomNum() {
    generateSecureRandom(12).then(randomBytes => {
      return randomBytes;
    });
  }

  setUserId(txt){
    this.setState({userId:txt});
  }

  addDataToFirebase(userName, status) {
    var userId = Math.floor(Math.random() * 10000000000000) + 1;
    
    firebase
      .database()
      .ref('UsersList/')
      .push({
        userId,
        userName,
        status,
      })
      .then(data => {
        //success callback
        this.setUserId(userId);
        this.startChatListScreen();
        console.log('data ', data);
      })
      .catch(error => {
        //error callback
        Alert.alert('Error in data addition in firebase : ' + error.toString());
        ///console.log('error ', error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{
              uri: 'https://png.icons8.com/male-user/ultraviolet/50/3498db',
            }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Enter Name"
            keyboardType="email-address"
            underlineColorAndroid="transparent"
            onChangeText={fullName => this.setState({fullName})}
          />
        </View>

        <TouchableHighlight
          style={[styles.buttonContainer, styles.signupButton]}
          onPress={() => this.addDataToFirebase(this.state.fullName, 'active')}>
          <Text style={styles.signUpText}>Start Chatting</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00b5ec',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
  },
  signupButton: {
    backgroundColor: '#FF4DFF',
  },
  signUpText: {
    color: 'white',
  },
});
