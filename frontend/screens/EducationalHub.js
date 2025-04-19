import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const EducationalHub = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const tips = [
    { id: 1, text: 'Did you know? Turning off lights saves energy!', icon: 'lightbulb-outline' },
    { id: 2, text: 'Recycling one aluminum can saves enough energy to run a TV for 3 hours!', icon: 'recycle' },
    { id: 3, text: 'Using a reusable water bottle can save up to 167 plastic bottles per year!', icon: 'local-drink' },
    { id: 4, text: 'Planting trees helps reduce carbon dioxide in the atmosphere.', icon: 'nature' },
    { id: 5, text: 'Composting food waste reduces methane emissions from landfills.', icon: 'compost' },
  ];

  const allQuestions = [
    {
      question: 'What is the best way to reduce plastic waste?',
      options: ['Use reusable bags', 'Burn plastic', 'Throw plastic in the ocean'],
      correctAnswer: 'Use reusable bags',
    },
    {
      question: 'How can you save energy at home?',
      options: ['Leave lights on', 'Unplug devices when not in use', 'Use a heater in summer'],
      correctAnswer: 'Unplug devices when not in use',
    },
    {
      question: 'What is composting?',
      options: [
        'Throwing food in the trash',
        'Turning food waste into fertilizer',
        'Burning food waste',
      ],
      correctAnswer: 'Turning food waste into fertilizer',
    },
    {
      question: 'Which of these is a renewable energy source?',
      options: ['Coal', 'Solar power', 'Natural gas'],
      correctAnswer: 'Solar power',
    },
    {
      question: 'What is the main benefit of carpooling?',
      options: ['Increased traffic', 'Reduced carbon emissions', 'Higher fuel consumption'],
      correctAnswer: 'Reduced carbon emissions',
    },
    {
      question: 'What is the largest source of renewable energy worldwide?',
      options: ['Wind', 'Hydroelectric', 'Solar'],
      correctAnswer: 'Hydroelectric',
    },
    {
      question: 'What is the primary greenhouse gas emitted by human activities?',
      options: ['Methane', 'Carbon dioxide', 'Nitrous oxide'],
      correctAnswer: 'Carbon dioxide',
    },
    {
      question: 'Which of these materials is biodegradable?',
      options: ['Plastic', 'Glass', 'Paper'],
      correctAnswer: 'Paper',
    },
    {
      question: 'What is the main cause of deforestation?',
      options: ['Agriculture', 'Urbanization', 'Mining'],
      correctAnswer: 'Agriculture',
    },
    {
      question: 'What is the purpose of a carbon footprint?',
      options: [
        'To measure water usage',
        'To measure greenhouse gas emissions',
        'To measure energy consumption',
      ],
      correctAnswer: 'To measure greenhouse gas emissions',
    },
    {
      question: 'What is the most effective way to reduce water usage?',
      options: ['Take longer showers', 'Fix leaky faucets', 'Water plants during the day'],
      correctAnswer: 'Fix leaky faucets',
    },
    {
      question: 'What is the main benefit of using LED bulbs?',
      options: ['They are cheaper', 'They use less energy', 'They last longer'],
      correctAnswer: 'They use less energy',
    },
    {
      question: 'What is the main purpose of recycling?',
      options: [
        'To reduce waste in landfills',
        'To create more plastic',
        'To increase energy consumption',
      ],
      correctAnswer: 'To reduce waste in landfills',
    },
    {
      question: 'What is the main benefit of using public transportation?',
      options: ['Increased traffic', 'Reduced carbon emissions', 'Higher fuel consumption'],
      correctAnswer: 'Reduced carbon emissions',
    },
    {
      question: 'What is the main cause of ocean pollution?',
      options: ['Plastic waste', 'Fish waste', 'Natural algae'],
      correctAnswer: 'Plastic waste',
    },
    {
      question: 'What is the main benefit of using solar panels?',
      options: ['They are expensive', 'They reduce electricity bills', 'They increase carbon emissions'],
      correctAnswer: 'They reduce electricity bills',
    },
    {
      question: 'What is the main purpose of a rain barrel?',
      options: ['To store rainwater', 'To increase water usage', 'To waste water'],
      correctAnswer: 'To store rainwater',
    },
    {
      question: 'What is the main benefit of planting trees?',
      options: ['They increase carbon dioxide', 'They provide shade', 'They reduce air pollution'],
      correctAnswer: 'They reduce air pollution',
    },
    {
      question: 'What is the main cause of global warming?',
      options: ['Natural climate cycles', 'Human activities', 'Volcanic eruptions'],
      correctAnswer: 'Human activities',
    },
    {
      question: 'What is the main benefit of using a reusable water bottle?',
      options: ['It increases plastic waste', 'It saves money', 'It reduces plastic waste'],
      correctAnswer: 'It reduces plastic waste',
    },
    {
      question: 'What is the main purpose of a carbon offset?',
      options: [
        'To increase carbon emissions',
        'To reduce carbon emissions',
        'To measure water usage',
      ],
      correctAnswer: 'To reduce carbon emissions',
    },
    {
      question: 'What is the main benefit of using a programmable thermostat?',
      options: ['It increases energy usage', 'It reduces energy usage', 'It does nothing'],
      correctAnswer: 'It reduces energy usage',
    },
    {
      question: 'What is the main cause of air pollution in cities?',
      options: ['Trees', 'Cars and factories', 'Rain'],
      correctAnswer: 'Cars and factories',
    },
    {
      question: 'What is the main benefit of using a clothesline instead of a dryer?',
      options: ['It increases energy usage', 'It reduces energy usage', 'It does nothing'],
      correctAnswer: 'It reduces energy usage',
    },
    {
      question: 'What is the main purpose of a green roof?',
      options: [
        'To increase energy usage',
        'To reduce energy usage',
        'To waste water',
      ],
      correctAnswer: 'To reduce energy usage',
    },
    {
      question: 'What is the main benefit of using a bike instead of a car?',
      options: ['It increases carbon emissions', 'It reduces carbon emissions', 'It does nothing'],
      correctAnswer: 'It reduces carbon emissions',
    },
    {
      question: 'What is the main cause of soil erosion?',
      options: ['Planting trees', 'Deforestation', 'Rain'],
      correctAnswer: 'Deforestation',
    },
    {
      question: 'What is the main benefit of using energy-efficient appliances?',
      options: ['They use more energy', 'They use less energy', 'They do nothing'],
      correctAnswer: 'They use less energy',
    },
    {
      question: 'What is the main purpose of a community garden?',
      options: ['To increase waste', 'To reduce waste and promote sustainability', 'To waste water'],
      correctAnswer: 'To reduce waste and promote sustainability',
    },
  ];

  useEffect(() => {
    if (quizStarted) {
      if (allQuestions.length > 0) {
        const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
        setSelectedQuestions(shuffledQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
      } else {
        Alert.alert('Error', 'No questions available. Please try again later.');
        setQuizStarted(false);
      }
    }
  }, [quizStarted]);

  const handleNextTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const submitScore = async (finalScore) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://192.168.56.1:5000/api/quiz/score',
        {
          score: finalScore,
          totalQuestions: selectedQuestions.length,
        },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
    } catch (error) {
      console.error('Failed to submit score', error);
    }
  };

  const handleAnswer = (answer) => {
    const isCorrect = answer === selectedQuestions[currentQuestionIndex].correctAnswer;
    setFeedback(isCorrect ? 'Correct!' : 'Incorrect!');
    if (isCorrect) setScore((prevScore) => prevScore + 1);

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < selectedQuestions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        const finalScore = score + (isCorrect ? 1 : 0);
        Alert.alert(
          'Quiz Completed!',
          `Your score: ${finalScore}/${selectedQuestions.length}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setQuizStarted(false);
                submitScore(finalScore);
              },
            },
          ]
        );
      }
    }, 1000);
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Learn & Earn</Text>

      {!quizStarted ? (
        <>
          <View style={styles.tipCard}>
            <MaterialIcons
              name={tips[currentTipIndex].icon}
              size={60}
              color="#4CAF50"
              style={styles.tipIcon}
            />
            <Text style={styles.tipTitle}>{tips[currentTipIndex].text}</Text>
            <Text style={styles.tipSubtitle}>Learn something new every day and make a difference!</Text>
            <TouchableOpacity onPress={handleNextTip} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next Tip</Text>
              <FontAwesome name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.quizCard}>
            <MaterialIcons
              name="quiz"
              size={60}
              color="#4CAF50"
              style={styles.quizIcon}
            />
            <Text style={styles.quizTitle}>Ready to Test Your Knowledge?</Text>
            <Text style={styles.quizSubtitle}>Take a quick quiz and earn points while learning!</Text>
            <TouchableOpacity onPress={() => setQuizStarted(true)} style={styles.quizButton}>
              <Text style={styles.quizButtonText}>Start Quiz</Text>
              <FontAwesome name="play-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.quizContainer}>
          {currentQuestion ? (
            <>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {selectedQuestions.length}
              </Text>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswer(option)}
                  style={styles.optionButton}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
              {feedback && (
                <Text
                  style={[
                    styles.feedbackText,
                    { color: feedback === 'Correct!' ? '#4CAF50' : '#FF5252' },
                  ]}
                >
                  {feedback}
                </Text>
              )}
              <Text style={styles.scoreText}>Score: {score}</Text>
            </>
          ) : (
            <Text style={styles.errorText}>No questions available. Please try again later.</Text>
          )}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28, // Increased font size
    fontWeight: 'bold',
    marginBottom: 24, // Increased margin
    textAlign: 'center',
    color: '#4CAF50', // Green theme color
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 24, // Increased padding
    borderRadius: 20, // Rounded corners
    marginBottom: 24, // Increased margin
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // Increased shadow
    shadowOpacity: 0.1,
    shadowRadius: 10, // Softer shadow
    elevation: 10, // Increased elevation
  },
  tipIcon: {
    marginBottom: 20, // Increased margin
  },
  tipTitle: {
    fontSize: 20, // Increased font size
    fontWeight: 'bold', // Bold text
    textAlign: 'center',
    marginBottom: 12, // Increased margin
    color: '#333',
  },
  tipSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20, // Increased margin
    color: '#666',
    opacity: 0.8, // Subtle opacity
  },
  nextButton: {
    backgroundColor: '#4CAF50', // Green theme color
    padding: 16, // Increased padding
    borderRadius: 12, // Rounded corners
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased shadow
    shadowOpacity: 0.2,
    shadowRadius: 6, // Softer shadow
    elevation: 5, // Increased elevation
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold', // Bold text
    textAlign: 'center',
    marginRight: 8,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    padding: 24, // Increased padding
    borderRadius: 20, // Rounded corners
    marginBottom: 24, // Increased margin
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // Increased shadow
    shadowOpacity: 0.1,
    shadowRadius: 10, // Softer shadow
    elevation: 10, // Increased elevation
  },
  quizIcon: {
    marginBottom: 20, // Increased margin
  },
  quizTitle: {
    fontSize: 20, // Increased font size
    fontWeight: 'bold', // Bold text
    textAlign: 'center',
    marginBottom: 12, // Increased margin
    color: '#333',
  },
  quizSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20, // Increased margin
    color: '#666',
    opacity: 0.8, // Subtle opacity
  },
  quizButton: {
    backgroundColor: '#4CAF50', // Green theme color
    padding: 16, // Increased padding
    borderRadius: 12, // Rounded corners
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased shadow
    shadowOpacity: 0.2,
    shadowRadius: 6, // Softer shadow
    elevation: 5, // Increased elevation
  },
  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold', // Bold text
    textAlign: 'center',
    marginRight: 8,
  },
  quizContainer: {
    marginTop: 16,
  },
  progressText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF5252',
  },
});

export default EducationalHub;

