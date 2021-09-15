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
	TouchableWithoutFeedback,
	Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import {
	GOOGLE_CLOUD_VISION_API_KEY,
	API_URL_LICENCE,
} from './config/environment'

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

		//console.log(result)

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

		//console.log(result)

		if (!result.cancelled) {
			setImage(result.uri)
		}
	}

	const uploadImage = async () => {
		try {
			if (!image) {
				return
			}
			setUploading(true)
			const formData = new FormData()
			let uriPart_archivo = image.split('.')
			let fileExtension_archivo = uriPart_archivo[uriPart_archivo.length - 1]

			formData.append('imagen', {
				uri: image,
				name: `photo.${fileExtension_archivo}`,
				type: `image/${fileExtension_archivo}`,
			})

			let response = await fetch(
				`${API_URL_LICENCE}/api/products/upload-image`,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					method: 'POST',
					body: formData,
				}
			)
			let responseJson = await response.json()

			if (responseJson.statusCode === 200) {
				submitToGoogle(responseJson.imageInfo[0].file)
			} else {
				Alert.alert('Error guardando la imagen')
			}
			setUploading(false)
		} catch (error) {
			console.log(error)
		}
	}

	const maybeRenderImage = () => {
		if (!image) {
			//return
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
					onPress={takePhoto}
					title='Toma una foto'
				/>
				<Button
					style={{ marginBottom: 10 }}
					title='Elija una imagen'
					onPress={pickImage}
				/>
				<Button
					style={{ marginBottom: 10 }}
					onPress={uploadImage}
					title='Analizar'
				/>

				<Button
					style={{ marginBottom: 10 }}
					onPress={removePhoto}
					title='Limpiar foto '
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

	const submitToGoogle = async (url) => {
		try {
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
								imageUri: `${API_URL_LICENCE}/${url}`,
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

			//console.log(responseJson.responses)
			setGoogleResponse(responseJson)
			setUploading(false)
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

	/*const renderItem = (item) => {
		;<Text>response: {JSON.stringify(item)}</Text>
	}*/

	const renderItem = ({ item }) => (
		<TouchableWithoutFeedback key={item}>
			<View>
				<Text>Item: {item.description}</Text>
			</View>
		</TouchableWithoutFeedback>
	)

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			{image && (
				<Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
			)}

			{maybeRenderImage()}
			{maybeRenderUploadingOverlay()}

			{googleResponse && (
				<FlatList
					data={googleResponse.responses[0].textAnnotations}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
				/>
			)}
		</View>
	)
}
