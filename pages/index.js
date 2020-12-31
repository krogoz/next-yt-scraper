import React, {useEffect, useState, useRef} from 'react';

import Head from 'next/head'
import styles from 'styles/Home.module.sass'

import {
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
  MenuItem,
  Container,
  Button,
  Box,
  Select,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
} from '@material-ui/core'

import {Alert} from "@material-ui/lab"

import {
  Menu,
  VpnKey,
  Videocam,
  Search,
  Sort,
  Send,
  Copyright
} from "@material-ui/icons"

const Home = () => {

  /**
   * Api State
   */
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [comments, setComments] = useState(null)
  const [textareaValue, setTextareaValue] = useState('N/A')

  /**
   * Alert State
   */
  const [alertTimeout, setAlertTimeout] = useState(null)

  /**
   * Form State
   */
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState(false)
  
  const [videoId, setVideoId] = useState('')
  const [videoIdError, setVideoIdError] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Most Recent')

  useEffect(()=>{
    if (localStorage.getItem('apiKey')) setApiKey(localStorage.getItem('apiKey'))
    if (localStorage.getItem('searchTerm')) setSearchTerm(localStorage.getItem('searchTerm'))
  }, [])

  /**
   * Fires when sort by option is selected.
   * @param {*} e 
   */
  const handleSortByChange = e => {
    console.log(e.target.value)
    setSortBy(e.target.value)
  }

  /**
   * Stores apiKey in localStorage.
   */
  const saveApiKey = () => localStorage.setItem('apiKey', apiKey)

  /**
   * Stores searchTerm in localStorage.
   */
  const saveSearchTerm = () => localStorage.setItem('searchTerm', searchTerm)

  /**
   * Attempts to fetch comments.
   * @returns {Promise<Object>}
   */
  const scrape = async () => {
    const response = await fetch('http://localhost:3000/api/scrape', {
      method: 'post',
      body: JSON.stringify({
        apiKey,
        videoId,
        searchTerm,
        sortBy
      })
    })
    const {comments} = await response.json()
    return comments
  }

  /**
   * Validates form.
   */
  const validateForm = () => {
    let isValid = true
    if (!apiKey) {
      setApiKeyError(true)
      isValid = false
    } else {
      setApiKeyError(false)
    }
    if (!videoId) {
      setVideoIdError(true)
      isValid = false
    } else {
      setVideoIdError(false)
    }
    return isValid
  }

  /**
   * Fires once form is submitted.
   */
  const handleSubmitForm = async () => {
    const isValid = validateForm()
    if (isValid) {
      if (alertTimeout) {
        clearTimeout(alertTimeout)
        setSuccess(false)
      }
      setIsLoading(true)

      saveApiKey()
      saveSearchTerm()

      const fetchedComments = await scrape()
      setComments(fetchedComments)

      if (fetchedComments) {
        createCopyText(fetchedComments)
        const tmOut = setTimeout(()=>{
          setSuccess(false)
        }, 8000)
        setAlertTimeout(tmOut)
      }

      setIsLoading(false)
    }
  }

  const textareaRef = useRef(null)

  const createCopyText = comments => {
    let copyText = ''
    comments.forEach(comment => {
      copyText += comment + '\n'
    })
    console.log(copyText)
    setTextareaValue(copyText)
    setTimeout(()=>{
      console.log('timeout called')
      textareaRef.current.select()
      textareaRef.current.setSelectionRange(0, 99999)
      document.execCommand('copy')
      setSuccess(true)
    }, 500)
  }

  return (
    <>
      <Head>
        <title>Youtube Comment Scraper</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="menu">
            <Menu />
          </IconButton>
          <Typography variant="h6" color="inherit">
            Youtube Comment Scraper
          </Typography>
        </Toolbar>
      </AppBar>

      <Container style={{display: 'flex', justifyContent: 'center'}} >

        <Paper elevation={3} className={styles.form}>

          {success &&
            <Box className={styles['form-item']}>
              <Alert severity="success">{comments ? comments.length : 0} Comments copied to clipboard!</Alert>
            </Box>
          }

          <Box className={styles['form-item']}>

            <TextField
              label="Google API Key"
              value={apiKey}
              onChange={e=>setApiKey(e.target.value)}
              error={apiKeyError}
              helperText="Required*"
            />
          </Box>

          <Box className={styles['form-item']} >
            <TextField
              label="Youtube Video ID"
              value={videoId}
              onChange={e=>setVideoId(e.target.value)}
              error={videoIdError}
              helperText="Required*"
            />
          </Box>

          <Box className={styles['form-item']} >
            <TextField
              label="Search Term"
              value={searchTerm}
              onChange={e=>setSearchTerm(e.target.value)}
              helperText="Optional"
            />
          </Box>

          <Box className={styles['form-item']} >
            <FormControl>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                onChange={e=>handleSortByChange(e)}
                >
                <MenuItem value='Most Recent'>Most Recent</MenuItem>
                <MenuItem value='Relevance'>Relevance</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box className={styles['form-item']} >
            <Button 
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmitForm}
            >
              {!isLoading ? (
                <>
                  <Send fontSize="small" style={{marginRight: 8}} />
                  Scrape Comments
                </>
              ):(
                <>
                  <CircularProgress color="inherit" size={20} variant="indeterminate" style={{marginRight: 8}} />
                  Loading...
                </>
              )}
            </Button>
          </Box>

          <textarea
            ref={textareaRef}
            rows="5"
            value={textareaValue}
            style={{display: 'block'}}
          ></textarea>
          
        </Paper>

      </Container>
    </>
  )
}

export default Home