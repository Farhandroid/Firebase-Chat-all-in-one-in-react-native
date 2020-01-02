import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
  FlatList,
  Button,
} from 'react-native';
import firebase from 'firebase';

var dataGlobal = [];
var copyOfPreviousGlobalData = [];
export default class ChatScreen extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.init();
    this.state = {
      isUserIdSetCompleted: false,
      isMessageReceiverUserIdSetCompleted: false,
      message: '',
      messageSenderUserName: '',
      messageSenderUserId: '',
      messageReceiverUserId: '',
      messageReceiverUserName: '',
      messageDataFromServer: [],
      chatNodeForFirebase: '',
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.getMessageReceiverAndSenderData();
  }
  componentWillUnmount() {
    this._isMounted = false;
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

  listenForMessageReceives = () => {
    let instance = this;
    var tasksRef = 'Message/' + instance.getNodeName() + '/';

    firebase
      .database()
      .ref(tasksRef)
      .on('value', dataSnapshot => {
        var data = [];
        dataSnapshot.forEach(child => {
          var temp = {};
          temp['messageId'] = child.val().messageId;
          temp['message'] = child.val().message;

          ///console.log("data sennderid : "+ )
          if (
            child.val().messageSenderUserId === this.state.messageSenderUserId
          ) {
            temp['type'] = 'out';
          } else {
            temp['type'] = 'in';
          }
          data.push(temp);
        });
        console.log(
          'listenForMessageReceives val data: ' + JSON.stringify(data),
        );
        data.reverse();
        instance.setState(
          {
            messageDataFromServer: data,
          },
          function() {
            console.log(
              'listenForMessageReceives after: ' +
                JSON.stringify(instance.state.messageDataFromServer),
            );
          },
        );
      });
  };

  getNodeName = () => {
    let instance = this;
    console.log('getNodeName : ' + instance.state.messageReceiverUserId);
    if (
      instance.state.messageReceiverUserId > instance.state.messageSenderUserId
    ) {
      return (
        instance.state.messageReceiverUserId +
        instance.state.messageSenderUserId
      );
    } else {
      return (
        instance.state.messageSenderUserId +
        instance.state.messageReceiverUserId
      );
    }
  };

  addDataToFirebase = message => {
    console.log('addDataToFirebase : ' + this.getNodeName());
    var messageId = Math.floor(Math.random() * 10000000000000) + 1;

    // var dataJSON = [];
    // dataJSON.push({
    //   messageId: messageId,
    //   senderId:this.state.messageSenderUserId,
    //   type: type,
    // });
    // console.log('addDataToFirebase : ' + JSON.stringify(dataJSON));
    // console.log(
    //   'addDataToFirebase stateData : ' +
    //     JSON.stringify(this.state.messageDataFromServer),
    // );
    var messageSenderUserId = this.state.messageSenderUserId;
    firebase
      .database()
      .ref('Message/' + this.getNodeName() + '/')
      .push({
        message,
        messageSenderUserId,
        messageId,
      })
      .then(data => {
        /* this.setState({
          messageDataFromServer: [
            ...this.state.messageDataFromServer,
            dataJSON,
          ],
        }); */
      })
      .catch(error => {
        console.log('ChatScreenFirebaseError : ' + error.toString());
        Alert.alert(
          'Error in data addition in firebase in Chatscreen : ' +
            error.toString(),
        );
      });
  };

  renderDate = date => {
    return <Text style={styles.time}>{date}</Text>;
  };

  setFirebaseChatNodeName = () => {
    let instance = this;
    console.log('setFirebaseChatNodeName : ' + this.getNodeName());
    instance.setState(
      {
        chatNodeForFirebase: this.getNodeName(),
      },
      function() {
        instance.listenForMessageReceives();
      },
    );
  };

  getMessageReceiverAndSenderData = () => {
    let instance = this;
    var messageSenderUserNameLocal = instance.props.navigation.getParam(
      'messageSenderUserName',
      'N/A',
    );

    var messageSenderUserIdLocal = instance.props.navigation.getParam(
      'messageSenderUserId',
      'N/A',
    );

    var messageReceiverUserNameLocal = instance.props.navigation.getParam(
      'messageReceiverUserName',
      'N/A',
    );

    var messageReceiverUserIdLocal = instance.props.navigation.getParam(
      'messageReceiverUserId',
      'N/A',
    );

    console.log(
      'ChatScreen messageSenderUserName : ' +
        messageSenderUserNameLocal +
        '  messageSenderUserId : ' +
        messageSenderUserIdLocal,
    );
    console.log(
      'ChatScreen messageReceiverUserName : ' +
        messageReceiverUserNameLocal +
        ' messageReceiverUserId : ' +
        messageReceiverUserIdLocal,
    );

    instance.setState(
      {
        messageSenderUserName: messageReceiverUserNameLocal,
        messageSenderUserId: messageSenderUserIdLocal,
        messageSenderUserName: messageReceiverUserNameLocal,
        messageReceiverUserId: messageReceiverUserIdLocal,
      },
      function() {
        instance.setFirebaseChatNodeName();
      },
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          //inverted
          inverted={-1}
          data={this.state.messageDataFromServer}
          extraData={this.state}
          ///initialScrollIndex={this.state.data.length - 1}
          keyExtractor={item => {
            return item.messageId;
          }}
          renderItem={message => {
            console.log(item);
            const item = message.item;
            let inMessage = item.type === 'in';
            let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
            return (
              <View style={[styles.item, itemStyle]}>
                {!inMessage && this.renderDate(item.date)}
                <View style={[styles.balloon]}>
                  <Text>{item.message}</Text>
                </View>
                {inMessage && this.renderDate(item.date)}
              </View>
            );
          }}
        />
        <View style={styles.footer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputs}
              placeholder="Write a message..."
              underlineColorAndroid="transparent"
              onChangeText={message => this.setState({message})}
            />
          </View>

          <TouchableOpacity
            style={styles.btnSend}
            onPress={() => this.addDataToFirebase(this.state.message)}>
            <Image
              source={{
                uri: 'https://png.icons8.com/small/75/ffffff/filled-sent.png',
              }}
              style={styles.iconSend}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 17,
  },
  footer: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#eeeeee',
    paddingHorizontal: 10,
    padding: 5,
  },
  btnSend: {
    backgroundColor: '#00BFFF',
    width: 40,
    height: 40,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSend: {
    width: 30,
    height: 30,
    alignSelf: 'center',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  inputs: {
    height: 40,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  balloon: {
    maxWidth: 250,
    padding: 15,
    borderRadius: 20,
  },
  itemIn: {
    alignSelf: 'flex-start',
  },
  itemOut: {
    alignSelf: 'flex-end',
  },
  time: {
    alignSelf: 'flex-end',
    margin: 15,
    fontSize: 12,
    color: '#808080',
  },
  item: {
    marginVertical: 14,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#eeeeee',
    borderRadius: 300,
    padding: 5,
  },
});
