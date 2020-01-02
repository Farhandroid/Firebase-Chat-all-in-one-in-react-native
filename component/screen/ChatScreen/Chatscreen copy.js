/* eslint-disable no-dupe-keys */
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

export default class ChatScreen extends Component {
  constructor(props) {
    //this._isMounted = false;
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
    this.getMessageReceiverAndSenderData();
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
    var tasksRef = 'chatMessages/' + instance.getChatUID() + '/';
    console.log('listenForMessageReceives');

    firebase
      .database()
      .ref(tasksRef)
      .on('value', dataSnapshot => {
        // console.log(
        //   'listenForMessageReceives : ' + JSON.stringify(dataSnapshot),
        // );
        var data = [];
        var unsceneMessageData = [];
        dataSnapshot.forEach(child => {
          //console.log('Child : ' + child.key);

          if (child.key !== 'unsceneMessageData') {
            var temp = {};
            temp.messageId = child.val().messageUID;
            temp.message = child.val().message;
            if (
              child.val().messageSenderUserId === this.state.messageSenderUserId
            ) {
              temp.type = 'out';
            } else {
              temp.type = 'in';
            }
            data.push(temp);
          } else {
            console.log('Data add unsceneMessageData');
            console.log(
              'lastMessageSenderUserId : ' +
                child.val().lastMessageSenderUserId.toString(),
            );

            console.log(
              'unsceneMessageCount : ' +
                child.val().unsceneMessageCount.toString(),
            );
            var temp = {};
            temp.lastMessageSenderUserId = child.val().lastMessageSenderUserId;
            temp.unsceneMessageCount = child.val().unsceneMessageCount;
            unsceneMessageData.push(temp);

            console.log(
              'unsceneMessageData : ' + JSON.stringify(unsceneMessageData),
            );

            // console.log(
            //   'lastMessageSenderUserId : ' +
            //     unsceneMessageData.lastMessageSenderUserId.toString(),
            // );

            // console.log(
            //   'unsceneMessageCount : ' +
            //     child.val().unsceneMessageCount.toString(),
            // );
          }
        });

        // console.log(
        //   'lastMessageSenderUserId : ' +
        //     unsceneMessageData.lastMessageSenderUserId.toString(),
        // );

        // console.log(
        //   'unsceneMessageCount : ' +
        //     unsceneMessageData.unsceneMessageCount.toString(),
        // );

        if (
          unsceneMessageData[0].lastMessageSenderUserId !==
            this.state.messageSenderUserId &&
          unsceneMessageData[0].unsceneMessageCount > 0
        ) {
          console.log('Data add unsceneMessageData  found');
          this.addChatCountForMessageSeenOrUnseenDataInFirebase(0);
        } else {
          console.log('Data add unsceneMessageData not found');
        }

        data.reverse();
        instance.setState({
          messageDataFromServer: data,
        });
      });
  };

  getChatUID = () => {
    let instance = this;
    ///console.log('getChatUID : ' + instance.state.messageReceiverUserId);
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

  getRandomNumber = () => {
    return Math.floor(Math.random() * 10000000000000) + 1;
  };

  // addDataToFirebase = message => {
  //   console.log('addDataToFirebase : ' + this.getNodeName());
  //   var messageId = Math.floor(Math.random() * 10000000000000) + 1;
  //   var messageSenderUserId = this.state.messageSenderUserId;
  //   firebase
  //     .database()
  //     .ref('Message/' + this.getNodeName() + '/')
  //     .push({
  //       message,
  //       messageSenderUserId,
  //       messageId,
  //     })
  //     .then(data => {})
  //     .catch(error => {
  //       console.log('ChatScreenFirebaseError : ' + error.toString());
  //       Alert.alert(
  //         'Error in data addition in firebase in Chatscreen : ' +
  //           error.toString(),
  //       );
  //     });
  // };

  addDataToFirebase = message => {
    var messageUID = Math.floor(Math.random() * 10000000000000) + 1;
    var messageSenderUserId = this.state.messageSenderUserId;
    let chatUID = this.getChatUID();

    var messageDate = new Date().getDate(); //Current Date
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes();
    var messageTime = hours + ' : ' + min;

    firebase
      .database()
      .ref('chatMessages/' + chatUID + '/')
      .push({
        message,
        messageUID,
        messageTime,
        messageDate,
        messageSenderUserId,
      })
      .then(data => {
        this.addChatCountForMessageSeenOrUnseenDataInFirebase(1);
      })
      .catch(error => {
        console.log('ChatScreenFirebaseError : ' + error.toString());
        Alert.alert(
          'Error in data addition in firebase in Chatscreen : ' +
            error.toString(),
        );
      });
  };

  addChatCountForMessageSeenOrUnseenDataInFirebase = unsceneMessageCount => {
    let chatUID = this.getChatUID();
    let lastMessageSenderUserId = this.state.messageSenderUserId;

    firebase
      .database()
      .ref('chatMessages/' + chatUID + '/' + 'unsceneMessageData')
      .set({
        unsceneMessageCount,
        lastMessageSenderUserId,
      })
      .catch(error => {
        console.log(
          'addChatCountForMessageSeenOrUnseenDataInFirebase : ' +
            error.toString(),
        );
      });
  };

  addUserCahtsWithChatUIDinFirebaseForSender = () => {
    let chatUID = this.getChatUID();

    firebase
      .database()
      .ref('userChatsHistory/' + this.state.messageSenderUserId + '/')
      ///.push()
      .set({
        chatUID,
      });

    // firebase
    //   .database()
    //   .ref('userChatsHistory/' + this.state.messageSenderUserId + '/')
    //   .once('value', snapshot => {
    //     if (!snapshot.exists()) {
    //       firebase
    //         .database()
    //         .ref('userChatsHistory/' + this.state.messageSenderUserId + '/')
    //         .push({
    //           chatUID,
    //         });
    //     }
    //   });
  };

  addUserCahtsWithChatUIDinFirebaseForReceiver = () => {
    let chatUID = this.getChatUID();
    firebase
      .database()
      .ref('userChatsHistory/' + this.state.messageReceiverUserId + '/')
      ///.push()
      .set({
        chatUID,
      });
    // firebase
    //   .database()
    //   .ref('userChatsHistory/' + this.state.messageReceiverUserId + '/')
    //   .once('value', snapshot => {
    //     if (!snapshot.exists()) {
    //       firebase
    //         .database()
    //         .ref('userChatsHistory/' + this.state.messageReceiverUserId + '/')
    //         .push({
    //           chatUID,
    //         });
    //     }
    //   });
  };

  renderDate = date => {
    return <Text style={styles.time}>{date}</Text>;
  };

  setFirebaseChatNodeName = () => {
    let instance = this;
    console.log('setFirebaseChatNodeName : ' + this.getChatUID());
    instance.setState(
      {
        chatNodeForFirebase: this.getChatUID(),
      },
      function() {
        this.addUserCahtsWithChatUIDinFirebaseForSender();
        this.addUserCahtsWithChatUIDinFirebaseForReceiver();
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

  renderItem = ({item}) => {
    if (item.type === 'in') {
      return (
        <View style={styles.eachMsg}>
          {/*   <Image source={{ uri: item.image}} style={styles.userPic} /> */}
          <View style={styles.msgBlock}>
            <Text style={styles.msgTxt}>{item.message}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.rightMsg}>
          <View style={styles.rightBlock}>
            <Text style={styles.rightTxt}>{item.message}</Text>
          </View>
          {/*  <Image source={{uri: item.image}} style={styles.userPic} /> */}
        </View>
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          inverted={-1}
          data={this.state.messageDataFromServer}
          extraData={this.state}
          keyExtractor={item => {
            return item.messageId.toString();
          }}
          renderItem={this.renderItem}
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
  ///New
  eachMsg: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 5,
  },
  rightMsg: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 5,
    alignSelf: 'flex-end',
  },
  msgBlock: {
    width: 220,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    padding: 16,
    shadowColor: '#000000',
    elevation: 1,
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {
      height: 1,
    },
  },
  rightBlock: {
    width: 220,
    borderRadius: 20,
    elevation: 1,
    backgroundColor: '#97c163',
    padding: 16,
    shadowColor: '#3d3d3d',
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {
      height: 1,
    },
  },
  msgTxt: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  rightTxt: {
    fontSize: 15,
    color: '#202020',
    fontWeight: '600',
  },
  userPic: {
    height: 40,
    width: 40,
    margin: 5,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
});
