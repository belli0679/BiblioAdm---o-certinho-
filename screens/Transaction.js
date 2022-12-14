import React, {Component} from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, 
ImageBackground, CameraRoll, KeyboardAvoidingView, ToastAndroid } from "react-native";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
            domState: "normal",
            hasCameraPermissions: null,
            scanned: false,
            scannedData: "",
            bookId: "",
            studentId: "",
            bookName: "",
            studentName: ""

        }
    }

    getCameraPermissions = async domState => {
        const {status} = await Camera.requestCameraPermissionsAsync();

        this.setState({
            hasCameraPermissions: status === "granted",
            domState: domState,
            scanned: false});
    };

    handleBarCodeScanned = async ({ type, data }) => {
        const { domState } = this.state;
        if(domState === "bookId"){
          this.setState({
            bookId: data,
            domState: "normal",
            scanned: true
          });
        } else if (domState === "studentId"){
          this.setState({
            studentId: data,
            domState: "normal",
            scanned: true
          });
        }
      };

      handleTransaction = async () =>{
        var { bookId, studentId } = this.state;
        await this.getBookDetails(bookId);
        await this.getStudentDetails(studentId);

        db.collection("books")
          .doc(bookId)
          .get()
          .then(doc =>{
            var book = doc.data();
            if(book.is_book_available){
              var {bookName, studentName} = this.state;
              this.initiateBookIssue(bookId, studentId, bookName, studentName)
              ToastAndroid.show("Livro entregue para o aluno!", ToastAndroid.SHORT)
            } else {
              var {bookName, studentName} = this.state;
              this.initiateBookReturn(bookId, studentId, bookName, studentName)
              ToastAndroid.show("Livro entregue para a biblioteca!", ToastAndroid.SHORT)
            }
          })

      };

      initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
        //adcionar uma transa????o
        db.collection("transactions").add({
          student_id: studentId,
          student_name: studentName,
          book_id: bookId,
          book_name: bookName,
          date: firebase.firestore.TimeStamp.now().toDate(),
          transaction_type: "issue"

        })
        //alterar o status do livro
        db.collection("books")
          .doc(bookId)
          .update({
            is_book_available: false
          })
          //alterar o numero de livros retirados pelo aluno
          db.collection("students")
            .doc(studentId)
            .update({
              number_of_books_issued:firebase.firestore.FieldValue.increment(1)
            })
            //atualizar o estado local
            this.setState({
              bookId: "",
              studentId: ""
            })

      }

      initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
        //adcionar uma transa????o
        db.collection("transactions").add({
          student_id: studentId,
          student_name: studentName,
          book_id: bookId,
          book_name: bookName,
          date: firebase.firestore.TimeStamp.now().toDate(),
          transaction_type: "return"

        })
        //alterar o status do livro
        db.collection("books")
          .doc(bookId)
          .update({
            is_book_available: true
          })
          //alterar o numero de livros retirados pelo aluno
          db.collection("students")
            .doc(studentId)
            .update({
              number_of_books_issued:firebase.firestore.FieldValue.increment(-1)
            })
            //atualizar o estado local
            this.setState({
              bookId: "",
              studentId: ""
            })

      }
      

      getBookDetails = bookId =>{
        bookId = bookId.trim();
        db.collection("books")
          .where("book_id", "==", bookId)
          .get()
          .then(snapshot =>{
            snapshot.docs.map(doc =>{
              this.setState({bookName: doc.data().book_name})
            })
          })

      }

      getStudentDetails = studentId =>{
        studentId = studentId.trim();
        db.collection("students")
          .where("student_id", "==", studentId)
          .get()
          .then(snapshot =>{
            snapshot.docs.map(doc =>{
              this.setState({studentName: doc.data().student_name})
            })
          })

      }

    render(){
        const { bookId, studentId, domState, hasCameraPermissions, scannedData, scanned} = this.state;
        if(domState !== "normal"){
            return(
                <BarCodeScanner 
                        onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                        style = {StyleSheet.absoluteFillObject}/>
            );
        }
        
        return (
            <KeyboardAvoidingView behavior= "padding" style={styles.container}>

                <ImageBackground source = {bgImage} style = {styles.bgImage}>
                    <View style = {styles.upperContainer}>
                        <Image source = {appIcon} style = {styles.appIcon}/>
                        <Image source = {appName} style = {styles.appName}/>
                    </View>
              <View style={styles.lowerContainer}>
                <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={"Id livro"}
                      placeholderTextColor={"#FFFFFF"}
                      value = {bookId}
                      onChangeText = {text => this.setState({bookId: text})}
                      />
                    <TouchableOpacity
                      style={styles.scanbutton}
                      onPress = {()=>this.getCameraPermissions("bookId")}
                    >
                    <Text style={styles.scanButtonText}>Digitalizar</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.textInputContainer,{marginTop: 25}]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={"Id aluno"}
                      placeholderTextColor={"#FFFFFF"}
                      value = {studentId}
                      onChangeText = {text => this.setState({studentId: text})}
                      />
                    <TouchableOpacity
                      style={styles.scanbutton}
                      onPress = {()=>this.getCameraPermissions("studentId")}
                    >
                    <Text style={styles.scanButtonText}>Digitalizar</Text>
                    </TouchableOpacity>
                </View>

                  <TouchableOpacity style = {[styles.button, {marginTop: 25}]}
                                    onPress = {this.handleTransaction}>
                    <Text style = {styles.buttonText}>Enviar</Text>
                  </TouchableOpacity>

              </View>
              </ImageBackground>
            </KeyboardAvoidingView>
          );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#5653D4"
    },
    text:{
        color: "#FFF",
        fontSize: 30
    },
    buttonText: {
        color: "#FFF",
        fontSize: 30,
    },
    button:{
        width: "43%",
        height: 70,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F48D20",
        borderRadius: 15 
    },
    lowerContainer: {
        flex: 0.5,
        alignItems: "center"
      },
      textInputContainer: {
        borderWidth: 2,
        borderRadius: 10,
        flexDirection: "row",
        backgroundColor: "#9DFD24",
        borderColor: "#FFFFFF"
      },
      textInput: {
        width: "57%",
        height: 50,
        padding: 10,
        borderColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 3,
        fontSize: 18,
        backgroundColor: "#5653D4",
        fontFamily: "Rajdhani_600SemiBold",
        color: "#FFFFFF"
      },
      scanbutton: {
        width: 100,
        height: 50,
        backgroundColor: "#9DFD24",
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: "center",
        alignItems: "center"
      },
      scanButtonText: {
        fontSize: 20,
        color: "#0A0101",
        fontFamily: "Rajdhani_600SemiBold"
      },
      bgImage: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center"
      },
      upperContainer: {
        flex: 0.5,
        justifyContent: "center",
        alignItems: "center"
      },
      appIcon: {
        width: 200,
        height: 200,
        resizeMode: "contain",
        marginTop: 80
      },
      appName: {
        width: 180,
        resizeMode: "contain"
      }

})