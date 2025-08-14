import React, { useState, useEffect } from 'react';
import { EducationalContent } from '../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  User,
  ChevronRight,
  Heart,
  Activity,
  Apple,
  Brain,
  Dumbbell
} from 'lucide-react';

const Education: React.FC = () => {
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<EducationalContent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<EducationalContent | null>(null);

  useEffect(() => {
    // Mock educational content - Replace with actual API calls
    const mockContent: EducationalContent[] = [
      {
        id: '1',
        title: 'Understanding Diabetes: Types, Symptoms, and Management',
        content: `
          <h2>What is Diabetes?</h2>
          <p>Diabetes is a group of metabolic disorders characterized by high blood sugar levels over a prolonged period. It occurs when your body cannot produce enough insulin or cannot use insulin effectively.</p>
          
          <h3>Types of Diabetes</h3>
          <ul>
            <li><strong>Type 1 Diabetes:</strong> An autoimmune condition where the body attacks insulin-producing cells</li>
            <li><strong>Type 2 Diabetes:</strong> The most common form, where the body becomes resistant to insulin</li>
            <li><strong>Gestational Diabetes:</strong> Develops during pregnancy</li>
          </ul>
          
          <h3>Common Symptoms</h3>
          <p>Watch for these warning signs:</p>
          <ul>
            <li>Increased thirst and frequent urination</li>
            <li>Unexplained weight loss</li>
            <li>Fatigue and weakness</li>
            <li>Blurred vision</li>
            <li>Slow-healing cuts and bruises</li>
          </ul>
          
          <h3>Management Strategies</h3>
          <p>Effective diabetes management includes:</p>
          <ul>
            <li>Regular blood sugar monitoring</li>
            <li>Healthy diet and portion control</li>
            <li>Regular physical activity</li>
            <li>Medication adherence</li>
            <li>Regular medical check-ups</li>
          </ul>
        `,
        category: 'diabetes',
        readTime: '8 min read',
        author: 'Dr. Sarah Johnson',
        publishedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Hypertension: The Silent Killer and How to Control It',
        content: `
          <h2>Understanding High Blood Pressure</h2>
          <p>Hypertension, or high blood pressure, is often called the "silent killer" because it typically has no symptoms but can lead to serious health complications if left untreated.</p>
          
          <h3>What Do the Numbers Mean?</h3>
          <ul>
            <li><strong>Normal:</strong> Less than 120/80 mmHg</li>
            <li><strong>Elevated:</strong> 120-129/less than 80 mmHg</li>
            <li><strong>High Blood Pressure Stage 1:</strong> 130-139/80-89 mmHg</li>
            <li><strong>High Blood Pressure Stage 2:</strong> 140/90 mmHg or higher</li>
          </ul>
          
          <h3>Risk Factors</h3>
          <p>Several factors can increase your risk:</p>
          <ul>
            <li>Age and family history</li>
            <li>Excess weight and physical inactivity</li>
            <li>High sodium intake</li>
            <li>Stress and smoking</li>
            <li>Underlying health conditions</li>
          </ul>
          
          <h3>Prevention and Control</h3>
          <ul>
            <li>Maintain a healthy weight</li>
            <li>Follow the DASH diet</li>
            <li>Limit sodium and alcohol</li>
            <li>Exercise regularly</li>
            <li>Manage stress effectively</li>
            <li>Take medications as prescribed</li>
          </ul>
        `,
        category: 'hypertension',
        readTime: '7 min read',
        author: 'Dr. Michael Chen',
        publishedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        title: 'Heart-Healthy Nutrition: Foods That Protect Your Cardiovascular System',
        content: `
          <h2>The Foundation of Heart Health</h2>
          <p>What you eat directly impacts your heart health. A heart-healthy diet can lower your risk of heart disease, stroke, and other cardiovascular conditions.</p>
          
          <h3>Foods to Include</h3>
          <ul>
            <li><strong>Fatty Fish:</strong> Salmon, mackerel, sardines rich in omega-3 fatty acids</li>
            <li><strong>Leafy Greens:</strong> Spinach, kale, Swiss chard packed with vitamins and minerals</li>
            <li><strong>Whole Grains:</strong> Oats, brown rice, quinoa for fiber and nutrients</li>
            <li><strong>Berries:</strong> Blueberries, strawberries, raspberries for antioxidants</li>
            <li><strong>Nuts and Seeds:</strong> Almonds, walnuts, chia seeds for healthy fats</li>
          </ul>
          
          <h3>Foods to Limit</h3>
          <ul>
            <li>Processed and packaged foods high in sodium</li>
            <li>Sugary drinks and desserts</li>
            <li>Trans fats and saturated fats</li>
            <li>Excessive alcohol</li>
          </ul>
          
          <h3>The Mediterranean Diet</h3>
          <p>Consider adopting a Mediterranean-style eating pattern, which emphasizes:</p>
          <ul>
            <li>Plenty of fruits and vegetables</li>
            <li>Whole grains and legumes</li>
            <li>Olive oil as the primary fat source</li>
            <li>Moderate amounts of fish and poultry</li>
            <li>Limited red meat consumption</li>
          </ul>
        `,
        category: 'nutrition',
        readTime: '6 min read',
        author: 'Dr. Emily Rodriguez',
        publishedAt: '2024-01-25T09:15:00Z'
      },
      {
        id: '4',
        title: 'Exercise for Chronic Disease Management: Safe and Effective Workouts',
        content: `
          <h2>The Power of Physical Activity</h2>
          <p>Regular exercise is one of the most effective ways to manage chronic diseases and improve overall health. It can help control blood sugar, lower blood pressure, and strengthen your heart.</p>
          
          <h3>Benefits for Chronic Conditions</h3>
          <ul>
            <li><strong>Diabetes:</strong> Improves insulin sensitivity and blood sugar control</li>
            <li><strong>Hypertension:</strong> Helps lower blood pressure naturally</li>
            <li><strong>Heart Disease:</strong> Strengthens the heart muscle and improves circulation</li>
            <li><strong>Mental Health:</strong> Reduces stress, anxiety, and depression</li>
          </ul>
          
          <h3>Types of Exercise</h3>
          <p><strong>Aerobic Exercise (150 minutes/week):</strong></p>
          <ul>
            <li>Brisk walking</li>
            <li>Swimming</li>
            <li>Cycling</li>
            <li>Dancing</li>
          </ul>
          
          <p><strong>Strength Training (2-3 times/week):</strong></p>
          <ul>
            <li>Resistance bands</li>
            <li>Weight lifting</li>
            <li>Bodyweight exercises</li>
            <li>Yoga and Pilates</li>
          </ul>
          
          <h3>Safety Guidelines</h3>
          <ul>
            <li>Start slowly and gradually increase intensity</li>
            <li>Always warm up and cool down</li>
            <li>Stay hydrated during exercise</li>
            <li>Monitor your body's response</li>
            <li>Consult your doctor before starting a new program</li>
          </ul>
        `,
        category: 'exercise',
        readTime: '9 min read',
        author: 'Dr. James Wilson',
        publishedAt: '2024-02-01T16:45:00Z'
      },
      {
        id: '5',
        title: 'Managing Chronic Disease Stress: Mental Health Strategies',
        content: `
          <h2>The Mind-Body Connection</h2>
          <p>Living with a chronic disease can be emotionally challenging. Stress and anxiety can worsen physical symptoms, making it crucial to address mental health as part of your overall care plan.</p>
          
          <h3>Common Emotional Challenges</h3>
          <ul>
            <li>Anxiety about the future and disease progression</li>
            <li>Depression and feelings of helplessness</li>
            <li>Frustration with lifestyle changes</li>
            <li>Social isolation and relationship strain</li>
            <li>Fear of complications or hospitalization</li>
          </ul>
          
          <h3>Coping Strategies</h3>
          <p><strong>Mindfulness and Meditation:</strong></p>
          <ul>
            <li>Practice deep breathing exercises</li>
            <li>Try guided meditation apps</li>
            <li>Focus on the present moment</li>
          </ul>
          
          <p><strong>Social Support:</strong></p>
          <ul>
            <li>Join support groups</li>
            <li>Stay connected with family and friends</li>
            <li>Consider counseling or therapy</li>
          </ul>
          
          <p><strong>Stress Management Techniques:</strong></p>
          <ul>
            <li>Regular sleep schedule</li>
            <li>Time management and prioritization</li>
            <li>Hobbies and enjoyable activities</li>
            <li>Progressive muscle relaxation</li>
          </ul>
          
          <h3>When to Seek Professional Help</h3>
          <p>Contact a mental health professional if you experience:</p>
          <ul>
            <li>Persistent sadness or hopelessness</li>
            <li>Loss of interest in activities</li>
            <li>Changes in sleep or appetite</li>
            <li>Difficulty concentrating</li>
            <li>Thoughts of self-harm</li>
          </ul>
        `,
        category: 'mental_health',
        readTime: '7 min read',
        author: 'Dr. Lisa Thompson',
        publishedAt: '2024-02-05T11:20:00Z'
      }
    ];

    setContent(mockContent);
  }, []);

  useEffect(() => {
    let filtered = content;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    setFilteredContent(filtered.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ));
  }, [content, searchTerm, categoryFilter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'diabetes': return <Activity className="h-5 w-5 text-red-600" />;
      case 'hypertension': return <Heart className="h-5 w-5 text-blue-600" />;
      case 'heart_disease': return <Heart className="h-5 w-5 text-red-600" />;
      case 'nutrition': return <Apple className="h-5 w-5 text-green-600" />;
      case 'exercise': return <Dumbbell className="h-5 w-5 text-purple-600" />;
      case 'mental_health': return <Brain className="h-5 w-5 text-indigo-600" />;
      default: return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'diabetes': return 'Diabetes';
      case 'hypertension': return 'Hypertension';
      case 'heart_disease': return 'Heart Disease';
      case 'nutrition': return 'Nutrition';
      case 'exercise': return 'Exercise';
      case 'mental_health': return 'Mental Health';
      default: return 'General';
    }
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ChevronRight className="h-4 w-4 transform rotate-180" />
          <span>Back to articles</span>
        </button>

        {/* Article Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-4">
            {getCategoryIcon(selectedArticle.category)}
            <span className="text-sm font-medium text-gray-600 capitalize">
              {getCategoryName(selectedArticle.category)}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{selectedArticle.title}</h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{selectedArticle.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{selectedArticle.readTime}</span>
            </div>
            <div>
              {new Date(selectedArticle.publishedAt).toLocaleDateString()}
            </div>
          </div>
          
          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
          />
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContent
              .filter(article => 
                article.id !== selectedArticle.id && 
                article.category === selectedArticle.category
              )
              .slice(0, 4)
              .map((article) => (
                <div
                  key={article.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedArticle(article)}
                >
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>{article.readTime}</span>
                    <span>{article.author}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Education Hub</h1>
        <p className="text-gray-600">
          Expert-reviewed articles and resources to help you manage your health
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="diabetes">Diabetes</option>
              <option value="hypertension">Hypertension</option>
              <option value="heart_disease">Heart Disease</option>
              <option value="nutrition">Nutrition</option>
              <option value="exercise">Exercise</option>
              <option value="mental_health">Mental Health</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      {filteredContent.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            {getCategoryIcon(filteredContent[0].category)}
            <span className="text-sm font-medium text-blue-100 capitalize">
              Featured • {getCategoryName(filteredContent[0].category)}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-4">{filteredContent[0].title}</h2>
          <div className="flex items-center space-x-6 text-sm text-blue-100 mb-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{filteredContent[0].author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{filteredContent[0].readTime}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedArticle(filteredContent[0])}
            className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span>Read Article</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.slice(1).map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="flex items-center space-x-2 mb-3">
              {getCategoryIcon(article.category)}
              <span className="text-sm font-medium text-gray-600 capitalize">
                {getCategoryName(article.category)}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
              {article.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all'
              ? 'No articles match your current search or filters.'
              : 'No educational content available at the moment.'
            }
          </p>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="#"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Heart className="h-8 w-8 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Emergency Guidelines</p>
              <p className="text-sm text-gray-600">When to seek immediate care</p>
            </div>
          </a>
          
          <a
            href="#"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Apple className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Meal Planning</p>
              <p className="text-sm text-gray-600">Healthy recipes and tips</p>
            </div>
          </a>
          
          <a
            href="#"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Dumbbell className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Exercise Programs</p>
              <p className="text-sm text-gray-600">Safe workouts for your condition</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Education;