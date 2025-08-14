import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Review } from '../types';
import { 
  Star, 
  Plus, 
  Search, 
  Filter,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

const Reviews: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    // Mock data - Replace with actual API calls
    const mockReviews: Review[] = user?.role === 'patient' ? [
      // Patient's reviews of doctors
      {
        id: '1',
        doctorId: '1',
        patientId: user?.id || '2',
        doctorName: 'Dr. Sarah Johnson',
        patientName: user?.name || 'John Doe',
        rating: 5,
        comment: 'Excellent care and very attentive to my concerns. Dr. Johnson always takes time to explain my condition and treatment options thoroughly.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        doctorId: '2',
        patientId: user?.id || '2',
        doctorName: 'Dr. Michael Brown',
        patientName: user?.name || 'John Doe',
        rating: 4,
        comment: 'Very knowledgeable and professional. The teleconsultation was smooth and convenient.',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        doctorId: '3',
        patientId: user?.id || '2',
        doctorName: 'Dr. Emily Chen',
        patientName: user?.name || 'John Doe',
        rating: 5,
        comment: 'Outstanding cardiologist! She helped me understand my heart condition and provided a comprehensive treatment plan.',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : [
      // Doctor's reviews from patients
      {
        id: '1',
        doctorId: user?.id || '1',
        patientId: '2',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'John Doe',
        rating: 5,
        comment: 'Excellent care and very attentive to my concerns. Always takes time to explain everything clearly.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        doctorId: user?.id || '1',
        patientId: '3',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'Jane Smith',
        rating: 4,
        comment: 'Very knowledgeable and helpful. Would recommend to others.',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        doctorId: user?.id || '1',
        patientId: '4',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'Bob Wilson',
        rating: 5,
        comment: 'Outstanding physician! Great communication and follow-up care.',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        doctorId: user?.id || '1',
        patientId: '5',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'Alice Cooper',
        rating: 5,
        comment: 'Very professional and caring. Helped me manage my diabetes effectively.',
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        doctorId: user?.id || '1',
        patientId: '6',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'David Lee',
        rating: 3,
        comment: 'Good doctor but the appointment was rushed. Could benefit from more time with patients.',
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setReviews(mockReviews);
  }, [user]);

  useEffect(() => {
    let filtered = reviews;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        (user?.role === 'patient' ? review.doctorName : review.patientName)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(review => review.rating === rating);
    }

    setFilteredReviews(filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, [reviews, searchTerm, ratingFilter, user]);

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const handleAddReview = () => {
    setShowAddReview(false);
    addNotification({
      title: 'Review Submitted',
      message: 'Thank you for your feedback!',
      type: 'success'
    });
  };

  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'patient' 
              ? 'Share your experience and help others find great healthcare providers'
              : 'Patient feedback to help you improve your practice'
            }
          </p>
        </div>
        
        {user?.role === 'patient' && (
          <button
            onClick={() => setShowAddReview(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Write Review</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-blue-600">{reviews.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">5-Star Reviews</p>
              <p className="text-2xl font-bold text-green-600">{ratingDistribution[5]}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {reviews.filter(r => {
                  const reviewDate = new Date(r.date);
                  const currentDate = new Date();
                  return reviewDate.getMonth() === currentDate.getMonth() && 
                         reviewDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution (for doctors) */}
      {user?.role === 'doctor' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                
                <span className="text-sm text-gray-600 w-8">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search by ${user?.role === 'patient' ? 'doctor name' : 'patient name'} or comment...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.role === 'patient' ? review.doctorName : review.patientName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              
              {user?.role === 'doctor' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Respond to Review
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || ratingFilter !== 'all' 
                ? 'No reviews match your filters' 
                : 'No reviews yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || ratingFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : user?.role === 'patient'
                  ? 'Share your experience with healthcare providers to help others.'
                  : 'Patient reviews will appear here once you start receiving feedback.'
              }
            </p>
            {user?.role === 'patient' && !searchTerm && ratingFilter === 'all' && (
              <button
                onClick={() => setShowAddReview(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write Your First Review
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Review Modal (Placeholder) */}
      {showAddReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h2>
            <p className="text-gray-600 mb-6">
              This is a placeholder for the review form. In a full implementation, 
              this would include fields for selecting a doctor, rating stars, 
              and a comment text area.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleAddReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowAddReview(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;