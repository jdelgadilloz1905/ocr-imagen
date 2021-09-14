/** @format */

import React, { useState, useEffect } from 'react'
import { Button, Image, View, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

export default function ImagePickerExample() {
	const [image, setImage] = useState(null)
	const [googleResponse, setGoogleResponse] = useState(null)

	useEffect(() => {
		;(async () => {
			if (Platform.OS !== 'web') {
				const { status } =
					await ImagePicker.requestMediaLibraryPermissionsAsync()
				if (status !== 'granted') {
					alert(
						'Lo sentimos, necesitamos permisos de cámara para que esto funcione'
					)
				}
			}
		})()
	}, [])

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		})

		console.log(result)

		if (!result.cancelled) {
			setImage(result.uri)
		}
	}

	const takePhoto = async () => {
		let result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		})

		console.log(result)

		if (!result.cancelled) {
			setImage(result.uri)
		}
	}

	const maybeRenderImage = () =>{

		if(!image){
			//return
		}

		return(
			<View
			style={{
				marginTop : 20,
				width:250,
				borderRadius: 2
			}}
			>
				<Button
					style={{ marginBottom: 10}}
					onPress={submitToGoogle}
					title="Analizar"
					/>

					<View
					style={{
						borderTopRightRadius:3,
						borderTopLeftRadius: 3,
						shadowColor:'rgba(0,0,0,1)',
						shadowOpacity:0.2,
						shadowOffset:{ width:4, height: 4},
						overflow:'hidden'

					}}
					>
					<Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
					</View>

			</View>
		)
	}

	const submitToGoogle = async () =>{

		try {
			
		} catch (error) {
			
			console.error(error)
		}
	}

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Button title='Elija una imagen' onPress={pickImage} />

			<Button onPress={takePhoto} title='Toma una foto' />

			{image && (
				<Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
			)}
			{!googleResponse && (
					maybeRenderImage()
				)
			}
		</View>
	)
}
