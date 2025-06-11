
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GraphNode {
  id?: string;
  type: string;
  properties: Record<string, any>;
  external_id?: string;
}

interface GraphRelationship {
  id?: string;
  from_node_id: string;
  to_node_id: string;
  type: string;
  properties: Record<string, any>;
  external_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    
    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { operation, data } = await req.json()

    switch (operation) {
      case 'create_graph_from_resume':
        return await createGraphFromResume(supabaseClient, user.id, data)
      
      case 'query_connections':
        return await queryConnections(supabaseClient, user.id, data)
      
      case 'suggest_connections':
        return await suggestConnections(supabaseClient, user.id, data)
      
      case 'get_graph_data':
        return await getGraphData(supabaseClient, user.id)
      
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

  } catch (error) {
    console.error('Error in graph-operations function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function createGraphFromResume(supabaseClient: any, userId: string, resumeData: any) {
  console.log('Creating graph from resume data:', resumeData)
  
  const nodes: GraphNode[] = []
  const relationships: GraphRelationship[] = []

  // Create person node
  const personNode = {
    type: 'person',
    properties: {
      name: resumeData.personalInfo?.fullName || 'Unknown',
      email: resumeData.personalInfo?.email || '',
      phone: resumeData.personalInfo?.phone || '',
      linkedin: resumeData.personalInfo?.linkedin || ''
    }
  }
  nodes.push(personNode)

  // Create company nodes and work relationships
  if (resumeData.workExperience && Array.isArray(resumeData.workExperience)) {
    for (const work of resumeData.workExperience) {
      const companyNode = {
        type: 'company',
        properties: {
          name: work.company,
          industry: work.industry || 'Unknown'
        }
      }
      nodes.push(companyNode)
    }
  }

  // Create skill nodes
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    for (const skill of resumeData.skills) {
      const skillNode = {
        type: 'skill',
        properties: {
          name: skill,
          category: 'technical' // Could be enhanced to categorize skills
        }
      }
      nodes.push(skillNode)
    }
  }

  // Create education nodes
  if (resumeData.education && Array.isArray(resumeData.education)) {
    for (const edu of resumeData.education) {
      const schoolNode = {
        type: 'school',
        properties: {
          name: edu.university,
          degree: edu.degree,
          field: edu.field,
          graduationYear: edu.graduationYear
        }
      }
      nodes.push(schoolNode)
    }
  }

  // Insert nodes into database
  const insertedNodes = []
  for (const node of nodes) {
    const { data, error } = await supabaseClient
      .from('graph_nodes')
      .insert({
        user_id: userId,
        node_type: node.type,
        properties: node.properties
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting node:', error)
      throw error
    }
    insertedNodes.push(data)
  }

  // Create relationships
  const personNodeId = insertedNodes[0].id
  let nodeIndex = 1

  // Person-Company relationships
  if (resumeData.workExperience && Array.isArray(resumeData.workExperience)) {
    for (const work of resumeData.workExperience) {
      const companyNodeId = insertedNodes[nodeIndex].id
      
      const { error } = await supabaseClient
        .from('graph_relationships')
        .insert({
          user_id: userId,
          from_node_id: personNodeId,
          to_node_id: companyNodeId,
          relationship_type: 'WORKED_AT',
          properties: {
            jobTitle: work.jobTitle,
            startDate: work.startDate,
            endDate: work.endDate,
            responsibilities: work.responsibilities || []
          }
        })

      if (error) {
        console.error('Error inserting work relationship:', error)
        throw error
      }
      nodeIndex++
    }
  }

  // Person-Skill relationships
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    for (let i = 0; i < resumeData.skills.length; i++) {
      const skillNodeId = insertedNodes[nodeIndex + i].id
      
      const { error } = await supabaseClient
        .from('graph_relationships')
        .insert({
          user_id: userId,
          from_node_id: personNodeId,
          to_node_id: skillNodeId,
          relationship_type: 'HAS_SKILL',
          properties: {
            proficiency: 'intermediate' // Could be enhanced with actual proficiency levels
          }
        })

      if (error) {
        console.error('Error inserting skill relationship:', error)
        throw error
      }
    }
    nodeIndex += resumeData.skills.length
  }

  // Person-School relationships
  if (resumeData.education && Array.isArray(resumeData.education)) {
    for (let i = 0; i < resumeData.education.length; i++) {
      const schoolNodeId = insertedNodes[nodeIndex + i].id
      
      const { error } = await supabaseClient
        .from('graph_relationships')
        .insert({
          user_id: userId,
          from_node_id: personNodeId,
          to_node_id: schoolNodeId,
          relationship_type: 'STUDIED_AT',
          properties: {
            degree: resumeData.education[i].degree,
            field: resumeData.education[i].field,
            graduationYear: resumeData.education[i].graduationYear
          }
        })

      if (error) {
        console.error('Error inserting education relationship:', error)
        throw error
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      nodesCreated: insertedNodes.length,
      message: 'Graph created successfully from resume data'
    }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function queryConnections(supabaseClient: any, userId: string, queryData: any) {
  const { nodeType, properties } = queryData
  
  // Find nodes based on query
  let query = supabaseClient
    .from('graph_nodes')
    .select('*')
    .eq('user_id', userId)

  if (nodeType) {
    query = query.eq('node_type', nodeType)
  }

  const { data: nodes, error } = await query

  if (error) {
    throw error
  }

  return new Response(
    JSON.stringify({ nodes }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function suggestConnections(supabaseClient: any, userId: string, suggestionData: any) {
  // This is a simplified version - in a real implementation, you'd use more sophisticated algorithms
  const { data: nodes, error: nodesError } = await supabaseClient
    .from('graph_nodes')
    .select('*')
    .eq('user_id', userId)

  if (nodesError) {
    throw nodesError
  }

  const { data: relationships, error: relsError } = await supabaseClient
    .from('graph_relationships')
    .select('*')
    .eq('user_id', userId)

  if (relsError) {
    throw relsError
  }

  // Simple suggestion: find nodes that could be connected but aren't
  const suggestions = []
  const companies = nodes.filter(n => n.node_type === 'company')
  const skills = nodes.filter(n => n.node_type === 'skill')

  // Suggest company-skill connections based on common industries
  for (const company of companies) {
    for (const skill of skills) {
      const existingRel = relationships.find(r => 
        (r.from_node_id === company.id && r.to_node_id === skill.id) ||
        (r.from_node_id === skill.id && r.to_node_id === company.id)
      )

      if (!existingRel) {
        suggestions.push({
          type: 'COMPANY_USES_SKILL',
          from: company,
          to: skill,
          confidence: 0.7,
          reason: `${company.properties.name} likely uses ${skill.properties.name}`
        })
      }
    }
  }

  return new Response(
    JSON.stringify({ suggestions: suggestions.slice(0, 10) }), // Limit to top 10
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function getGraphData(supabaseClient: any, userId: string) {
  const { data: nodes, error: nodesError } = await supabaseClient
    .from('graph_nodes')
    .select('*')
    .eq('user_id', userId)

  if (nodesError) {
    throw nodesError
  }

  const { data: relationships, error: relsError } = await supabaseClient
    .from('graph_relationships')
    .select('*')
    .eq('user_id', userId)

  if (relsError) {
    throw relsError
  }

  return new Response(
    JSON.stringify({ nodes, relationships }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
