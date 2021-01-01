import React, {useEffect, useState, useRef} from 'react';

import Head from 'next/head'
import styles from 'styles/Home.module.sass'

import {
  FormControl,
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
  Slider
} from '@material-ui/core'

import {Alert} from "@material-ui/lab"

import {
  Menu,
  Send,
} from "@material-ui/icons"

const Home = () => {

  /**
   * Api State
   */
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [comments, setComments] = useState(null)

  /**
   * Alert State
   */
  const [alertTimeout, setAlertTimeout] = useState(null)

  /**
   * Form State
   */
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState(false)
  
  const [videoUrl, setVideoUrl] = useState('')
  const [videoUrlError, setVideoUrlError] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Most Recent')

  const [resultsLimit, setResultsLimit] = useState(100)

  /**
   * Output textareas
   */
  const [urlTextareaValue, setUrlTextareaValue] = useState('N/A')
  const [textTextareaValue, setTextTextareaValue] = useState('N/A')

  useEffect(()=>{
    if (localStorage.getItem('apiKey')) setApiKey(localStorage.getItem('apiKey'))
    if (localStorage.getItem('searchTerm')) setSearchTerm(localStorage.getItem('searchTerm'))
  }, [])

  /**
   * Gets the Youtube Video ID from URL.
   * @param {String} url
   * @returns {String} videoId 
   */
  const getVideoIdFromUrl = url => {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : ''
  }

  /**
   * Fires when sort by option is selected.
   * @param {*} e 
   */
  const handleSortByChange = e => setSortBy(e.target.value)

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
    console.log(`scraping video id: ${getVideoIdFromUrl(videoUrl)} ...`)
    const response = await fetch('/api/scrape', {
      method: 'post',
      body: JSON.stringify({
        apiKey,
        videoId: getVideoIdFromUrl(videoUrl),
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
    if (!videoUrl) {
      setVideoUrlError(true)
      isValid = false
    } else {
      setVideoUrlError(false)
    }
    return isValid
  }

  /**
   * Clears existing alert
   */
  const removeAlert = () => {
    clearTimeout(alertTimeout)
    setSuccess(false)
  }

  /**
   * Fires once form is submitted.
   */
  const handleSubmitForm = async () => {
    const isValid = validateForm()
    if (isValid) {
      if (alertTimeout) removeAlert()
      setIsLoading(true)

      saveApiKey()
      saveSearchTerm()

      const fetchedComments = await scrape()
      setComments(fetchedComments)

      if (fetchedComments) {
        handleFetchedComments(fetchedComments)
        const tmOut = setTimeout(()=>{
          setSuccess(false)
        }, 8000)
        setAlertTimeout(tmOut)
      }

      setIsLoading(false)
    }
  }

  const urlTextareaRef = useRef(null)

  const handleFetchedComments = comments => {
    /**
     * Set limit on results
     */
    comments = comments.slice(0, resultsLimit)
    console.log(comments)

    let copyText = ''
    let textTextarea = ''

    /**
     * Create copyable texts
     */
    comments.forEach(comment => {
      copyText += comment.url + '\n'
      textTextarea += comment.text + '\n'
    })

    /**
     * Set textareas
     */
    setUrlTextareaValue(copyText)
    setTextTextareaValue(textTextarea)

    /**
     * Wait until state update, then copy url textarea and
     * show success alert.
     */
    setTimeout(()=>{
      urlTextareaRef.current.select()
      urlTextareaRef.current.setSelectionRange(0, 99999)
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

      <Container className={styles.container} >

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
              label="Youtube Video URL"
              value={videoUrl}
              onChange={e=>setVideoUrl(e.target.value)}
              error={videoUrlError}
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

          <Box className={styles['form-item']}>
            <TextField
              type="number"
              label="Limit Results"
              value={resultsLimit}
              onChange={e=>setResultsLimit(e.target.value)}
            />
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
          
        </Paper>

        <Paper elevation={3} className={styles.form}>
          <Box className={styles['form-item']}>
            <TextField
              inputRef={urlTextareaRef}
              value={urlTextareaValue}
              label="List of comment urls:"
              multiline
              rows={5}
              defaultValue="N/A"
              variant="filled"
            />
          </Box>
          
          <Box className={styles['form-item']}>
            <TextField
              value={textTextareaValue}
              label="List of comment texts:"
              multiline
              rows={5}
              defaultValue="N/A"
              variant="filled"
            />
          </Box>
        </Paper>

      </Container>
    </>
  )
}

export default Home