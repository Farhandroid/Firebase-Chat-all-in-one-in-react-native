import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-community/async-storage';

var isThisActivityOpenFirstTime = true;
export default class ShowAllConnectedUserScreen extends Component {
  constructor(props) {
    super(props);
    this.init();
    this.state = {
      isLoading: true,

      connectedUserData: [],
      userChatNodeList: [],
      userName: '',
      userId: '',
    };
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

  componentDidMount() {
    this.readUserData();
  }

  readUserData = () => {
    var tasks = [];
    let self = this;
    firebase
      .database()
      .ref('UsersList/')
      .on('value', function(snapshot) {
        snapshot.forEach(child => {
          var data = {};
          data.status = child.val().status;
          data.userId = child.val().userId;
          data.userName = child.val().userName;
          tasks.push(data);
        });

        self.setState(
          {
            connectedUserData: tasks,
          },
          function() {
            self.getDataFromAsyncstorage();
          },
        );
      });
  };

  listenForMessageReceives = () => {
    let instance = this;
    var tasksRef = 'UsersList/';

    firebase
      .database()
      .ref(tasksRef)
      .on('value', dataSnapshot => {
        console.log(
          'data in listenForMessageReceive: ' + JSON.stringify(dataSnapshot),
        );
        var tasks = [];
        dataSnapshot.forEach(child => {
          var data = {};
          data.status = child.val().status;
          data.userId = child.val().userId;
          data.userName = child.val().userName;
          tasks.push(data);
        });

        instance.setState({
          connectedUserData: tasks,
        });
      });
  };

  startChatScreen(
    messageSenderUserName,
    messageSenderUserId,
    messageReceiverUserName,
    messageReceiverUserId,
  ) {
    this.props.navigation.navigate('Chat', {
      messageSenderUserName,
      messageSenderUserId,
      messageReceiverUserName,
      messageReceiverUserId,
    });
  }

  getUserName = () => {
    let instance = this;
    instance.setState(
      {
        userName: instance.props.navigation.getParam('userName', 'N/A'),
      },
      function() {
        instance.listenForMessageReceives();
      },
    );
  };

  getDataFromAsyncstorage = async () => {
    try {
      let self = this;
      const userName = await AsyncStorage.getItem('@storage_username');
      const userId = await AsyncStorage.getItem('@storage_userId');

      console.log('userName getDataFromAsyncstorage : ' + userName);
      console.log('userId getDataFromAsyncstorage : ' + userId);

      if (userName !== null && userId !== null) {
        self.setState({userName, userId}, function() {
          self.getAllExistingChatNodeOfUser();
        });
      }
    } catch (e) {
      console.log('error is asyncstorage : ' + e.toString());
    }
  };

  getAllExistingChatNodeOfUser = () => {
    let self = this;
    let data = [];
    firebase
      .database()
      .ref('userChatsHistory/' + self.state.userId + '/')
      .on('value', snapshot => {
        if (snapshot.exists()) {
          snapshot.forEach(child => {
            let temp = {};
            temp.chatUID = child.val().chatUID;
            data.push(temp);
          });
          console.log(
            'getAllExistingChatNodeOfUser userChatNodeList : ' +
              JSON.stringify(data),
          );
          self.setState({userChatNodeList: data}, function() {
            self.startListenerForExistingChatNode();
          });
        }
      });
  };

  componentWillUnmount = () => {
    this.finishListenForExistingNodded();
  };

  finishListenForExistingNodded = () => {
    this.state.userChatNodeList.map(function(item) {
      firebase
        .database()
        .ref('chatMessages/' + item.chatUID + '/messageData/')
        .off('child_added');
    });
  };

  startListenerForExistingChatNode = () => {
    let self = this;
    let loopCount = 0;

    console.log(
      'startListenerForExistingChatNode userChatNodeList : ' +
        JSON.stringify(self.state.userChatNodeList),
    );
    console.log(
      ' isThisActivityOpenFirstTime = ' +
        isThisActivityOpenFirstTime.toString(),
    );

    console.log(
      ' userChatNodeList size = ' +
        self.state.userChatNodeList.length.toString(),
    );

    self.state.userChatNodeList.map(function(item) {
      console.log('startListenerForExistingChatNode chatUID : ' + item.chatUID);

      firebase
        .database()
        .ref('chatMessages/' + item.chatUID + '/messageData')
        .endAt()
        .limitToLast(1)
        .on('child_added', snapshot => {
          if (true) {
            if (snapshot.exists()) {
              console.log(
                'startListenerForExistingChatNode snapshot : ' +
                  JSON.stringify(snapshot),
              );
              console.log(
                'startListenerForExistingChatNode messageSenderUserId : ' +
                  snapshot.toJSON().messageSenderUserId,
              );

              if (
                snapshot.toJSON().messageSenderUserId.toString() !==
                self.state.userId.toString()
              ) {
                if (loopCount === self.state.userChatNodeList.length) {
                  self.findUserNameOfMessageSender(
                    snapshot.toJSON().messageSenderUserId,
                  );
                } else {
                  loopCount = loopCount + 1;
                }
              } else {
                if (loopCount !== self.state.userChatNodeList.length) {
                  loopCount = loopCount + 1;
                }
              }
            } else {
              console.log(
                'startListenerForExistingChatNode snapshot doesnt exist ',
              );
            }
          } else {
            console.log(
              ' isThisActivityOpenFirstTime2 = ' +
                isThisActivityOpenFirstTime.toString(),
            );
          }
        });

      if (loopCount === self.state.userChatNodeList.length) {
        console.log(
          ' isThisActivityOpenFirstTime3 = ' +
            isThisActivityOpenFirstTime.toString(),
        );
      }
    });
  };

  findUserNameOfMessageSender = userId => {
    let self = this;
    console.log('findUserNameOfMessageSender userId : ' + userId);

    self.state.connectedUserData.map(function(item) {
      if (item.userId.toString() === userId.toString()) {
        Alert.alert(item.userName + ' send you a message');
      }
    });
  };

  renderItem = ({item}) => {
    if (item.userName == this.state.userName) {
      return <View />;
    } else {
      return (
        <TouchableOpacity
          onPress={
            () =>
              this.startChatScreen(
                this.state.userName,
                this.state.userId,
                item.userName,
                item.userId,
              )
            //this.getDataFromAsyncstorage(item.userName, item.userId)
          }>
          <View style={styles.row}>
            {/*   {<Image source={{ uri: item.image }} style={styles.pic} />} */}
            <View>
              <View style={styles.nameContainer}>
                <Text
                  style={styles.nameTxt}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.userName}
                </Text>
                <Text style={styles.mblTxt}>Mobile</Text>
              </View>
              <View style={styles.msgContainer}>
                <Text style={styles.msgTxt}>Active</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        {!this.state.loading && (
          <FlatList
            data={this.state.connectedUserData}
            keyExtractor={item => {
              return item.socketId;
            }}
            renderItem={this.renderItem}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCDCDC',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 10,
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 18,
    width: 170,
  },
  mblTxt: {
    fontWeight: '200',
    color: '#777',
    fontSize: 13,
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgTxt: {
    fontWeight: '400',
    color: '#008B8B',
    fontSize: 12,
    marginLeft: 15,
  },
});
