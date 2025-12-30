import { useEffect } from 'react';
import { Typography, Card, List, Tag, Spin, Alert, Collapse } from 'antd';
import { useKnowledgeStore } from '../store/knowledgeStore';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const KnowledgePage = () => {
  const { curriculums, currentCurriculum, loading, error, fetchCurriculums, fetchCurriculum } = useKnowledgeStore();

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const handleCurriculumClick = async (id: number) => {
    await fetchCurriculum(id);
  };

  if (loading && curriculums.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="加载失败" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={2}>知识体系</Title>
      <Paragraph>选择课程开始学习</Paragraph>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={currentCurriculum ? [currentCurriculum] : curriculums}
        renderItem={(curriculum) => (
          <List.Item>
            <Card
              title={`${curriculum.grade} ${curriculum.semester}`}
              extra={<Tag color="blue">{curriculum.name}</Tag>}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCurriculumClick(curriculum.id)}
            >
              <Collapse>
                {curriculum.modules?.map((module) => (
                  <Panel header={`${module.module_name} ${module.module_tag ? `(${module.module_tag})` : ''}`} key={module.id}>
                    <Paragraph>{module.overview}</Paragraph>
                    <List
                      size="small"
                      dataSource={module.topics}
                      renderItem={(topic) => (
                        <List.Item>
                          <List.Item.Meta
                            title={topic.topic_name}
                            description={`${topic.alias || ''} · ${topic.knowledge_points?.length || 0} 个知识点`}
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default KnowledgePage;
