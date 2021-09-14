/** @format */

import React, { useState, useEffect } from 'react'
import {
	Button,
	Image,
	View,
	Platform,
	ActivityIndicator,
	StyleSheet,
	FlatList,
	Text,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { GOOGLE_CLOUD_VISION_API_KEY } from './config/environment'

export default function ImagePickerExample() {
	const [image, setImage] = useState(null)
	const [googleResponse, setGoogleResponse] = useState(null)
	const [uploading, setUploading] = useState(false)

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

	const maybeRenderImage = () => {
		if (!image) {
			return
		}

		return (
			<View
				style={{
					marginTop: 20,
					width: 250,
					borderRadius: 2,
				}}>
				<Button
					style={{ marginBottom: 10 }}
					onPress={submitToGoogle}
					title='Analizar'
				/>

				<View
					style={{
						borderTopRightRadius: 3,
						borderTopLeftRadius: 3,
						shadowColor: 'rgba(0,0,0,1)',
						shadowOpacity: 0.2,
						shadowOffset: { width: 4, height: 4 },
						overflow: 'hidden',
					}}></View>
			</View>
		)
	}

	const submitToGoogle = async () => {
		try {
			console.log('envio la foto a google vision ')
			setUploading(true)

			let body = JSON.stringify({
				requests: [
					{
						features: [
							{ type: 'LABEL_DETECTION', maxResults: 10 },
							{ type: 'LANDMARK_DETECTION', maxResults: 5 },
							{ type: 'FACE_DETECTION', maxResults: 5 },
							{ type: 'LOGO_DETECTION', maxResults: 5 },
							{ type: 'TEXT_DETECTION', maxResults: 5 },
							{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 5 },
							{ type: 'SAFE_SEARCH_DETECTION', maxResults: 5 },
							{ type: 'IMAGE_PROPERTIES', maxResults: 5 },
							{ type: 'CROP_HINTS', maxResults: 5 },
							{ type: 'WEB_DETECTION', maxResults: 5 },
						],
						image: {
							source: {
								imageUri:
									'https://www.visa.co.ve/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-classic-400x225.jpg',
							},
						},
					},
				],
			})
			let response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=' +
					GOOGLE_CLOUD_VISION_API_KEY,
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					method: 'POST',
					body: body,
				}
			)
			let responseJson = await response.json()
			console.info('mi resultado es ')
			//console.log(responseJson.responses)
			setGoogleResponse(responseJson)
			setUploading(false)
			console.log('  final ')
		} catch (error) {
			console.error(error)
		}
	}

	const maybeRenderUploadingOverlay = () => {
		if (uploading) {
			return (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: 'rgba(0,0,0,0.4)',
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}>
					<ActivityIndicator color='#fff' animating size='large' />
				</View>
			)
		}
	}

	const removePhoto = () => {
		setImage(null)
		setGoogleResponse(null)
	}

	const renderItem = (item) => {
		;<Text>response: {JSON.stringify(item)}</Text>
	}

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Button onPress={takePhoto} title='Toma una foto' />
			<Button title='Elija una imagen' onPress={pickImage} />

			{image && (
				<Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
			)}

			{maybeRenderImage()}
			{maybeRenderUploadingOverlay()}

			<Button onPress={removePhoto} title='Limpiar foto ' />
			{googleResponse && (
				<FlatList
					data={googleResponse.responses[0].textAnnotations}
					keyExtractor={(item, index) => item.id}
					renderItem={({ item }) => <Text>Item: {item.description}</Text>}
				/>
			)}
		</View>
	)
}
